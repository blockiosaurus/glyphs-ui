import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  rem,
  Badge,
  Group,
  Stack,
  Center,
  Button,
  Skeleton,
  Alert,
  Accordion,
  ThemeIcon,
} from '@mantine/core';
import { IconCircleDot, IconSun, IconInfinity, IconTallymark4, IconPuzzle2, IconSkull, IconCircleRectangle, IconPrism, IconAlertCircle, IconRefresh, IconBulb, IconClock, IconRocket, IconTarget } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSigner, Umi } from '@metaplex-foundation/umi';
import { excavate } from '@breadheads/bgl-glyphs';
import classes from './CountdownCards.module.css';
import { useUmi } from '@/providers/useUmi';

// Rarity configuration with power-of-two thresholds
const RARITIES = [
  { title: 'Stone', icon: IconCircleDot, type: 'fixed' as const, value: 1, cssClass: 'rarityStone' },
  { title: 'Jade', icon: IconCircleRectangle, type: 'power' as const, power: 10, cssClass: 'rarityJade' },
  { title: 'Bronze', icon: IconPrism, type: 'epoch' as const, cssClass: 'rarityBronze' },
  { title: 'Silver', icon: IconPuzzle2, type: 'power' as const, power: 20, cssClass: 'raritySilver' },
  { title: 'Gold', icon: IconSun, type: 'power' as const, power: 22, cssClass: 'rarityGold' },
  { title: 'Obsidian', icon: IconInfinity, type: 'power' as const, power: 24, cssClass: 'rarityObsidian' },
  { title: 'Neon', icon: IconTallymark4, type: 'power' as const, power: 26, cssClass: 'rarityNeon' },
  { title: 'Necrotic', icon: IconSkull, type: 'mystery' as const, cssClass: 'rarityNecrotic' },
] as const;

// Threshold for "imminent" badge animation (slots remaining)
const IMMINENT_THRESHOLD = 100;

// Default slot duration in ms (Solana averages ~400ms)
const DEFAULT_SLOT_DURATION_MS = 400;
const FETCH_INTERVAL_MS = 5000;
const TICK_INTERVAL_MS = 100; // Update display frequently for smooth countdown

interface EpochInfo {
  slotsInEpoch: number;
  slotIndex: number;
}

interface SlotSnapshot {
  slot: number;
  epochSlotsRemaining: number;
  timestamp: number;
}

function calcSlotsUntil(currentSlot: number, powerOfTwo: number): number {
  const nextPowerOfTwo = 2 ** powerOfTwo;
  return nextPowerOfTwo - (currentSlot % nextPowerOfTwo);
}

async function fetchSlotData(umi: Umi): Promise<SlotSnapshot> {
  const [currentSlot, epochInfo] = await Promise.all([
    umi.rpc.getSlot(),
    umi.rpc.call('getEpochInfo') as Promise<EpochInfo>,
  ]);
  return {
    slot: currentSlot,
    epochSlotsRemaining: epochInfo.slotsInEpoch - epochInfo.slotIndex,
    timestamp: Date.now(),
  };
}

function formatSlotCount(value: number): string {
  if (value > 1e6) {
    return `${(value / 1e6).toFixed(1)}m`;
  }
  if (value > 1e4) {
    return `${(value / 1e3).toFixed(1)}k`;
  }
  return Math.max(0, Math.floor(value)).toLocaleString();
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

// Calculate countdown for a rarity based on estimated current slot
function getCountdown(
  rarity: (typeof RARITIES)[number],
  estimatedSlot: number,
  estimatedEpochRemaining: number
): number | null {
  switch (rarity.type) {
    case 'fixed':
      return rarity.value;
    case 'power':
      return calcSlotsUntil(estimatedSlot, rarity.power);
    case 'epoch':
      return Math.max(0, estimatedEpochRemaining);
    case 'mystery':
      return null;
    default:
      return 0;
  }
}

export function CountdownCards() {
  const umi = useUmi();
  const [loading, setLoading] = useState(true);
  const [excavating, setExcavating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState('');

  // Snapshot from last fetch - used as baseline for interpolation
  const snapshotRef = useRef<SlotSnapshot | null>(null);
  // Estimated slot duration, calibrated from fetch intervals
  const slotDurationRef = useRef(DEFAULT_SLOT_DURATION_MS);
  // Store previous snapshot for slot duration calibration
  const prevSnapshotRef = useRef<SlotSnapshot | null>(null);

  // Current display values (updated frequently)
  const [displayCounts, setDisplayCounts] = useState<Map<string, { formatted: string; raw: number | null }>>(() =>
    new Map(RARITIES.map((r) => [r.title, { formatted: r.type === 'mystery' ? '?????' : '—', raw: null }]))
  );

  // Fetch fresh slot data and rebase
  const fetchAndRebase = useCallback(async () => {
    try {
      const snapshot = await fetchSlotData(umi);

      // Calibrate slot duration if we have a previous snapshot
      if (prevSnapshotRef.current) {
        const timeDelta = snapshot.timestamp - prevSnapshotRef.current.timestamp;
        const slotDelta = snapshot.slot - prevSnapshotRef.current.slot;
        if (slotDelta > 0 && timeDelta > 0) {
          const measuredDuration = timeDelta / slotDelta;
          // Smooth the estimate (weighted average with previous)
          slotDurationRef.current = slotDurationRef.current * 0.7 + measuredDuration * 0.3;
        }
      }

      prevSnapshotRef.current = snapshotRef.current;
      snapshotRef.current = snapshot;
      setError(null);
      setLastUpdated(new Date());
      return true;
    } catch (err) {
      setError('The excavation network is unreachable. Please check your connection and try again.');
      return false;
    }
  }, [umi]);

  // Interpolate current slot based on time elapsed since snapshot
  const estimateCurrentState = useCallback(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return null;

    const elapsed = Date.now() - snapshot.timestamp;
    const slotsElapsed = elapsed / slotDurationRef.current;

    return {
      slot: snapshot.slot + slotsElapsed,
      epochRemaining: snapshot.epochSlotsRemaining - slotsElapsed,
    };
  }, []);

  // Update display counts based on estimated slot
  const updateDisplay = useCallback(() => {
    const state = estimateCurrentState();
    if (!state) return;

    const newCounts = new Map<string, { formatted: string; raw: number | null }>();
    RARITIES.forEach((rarity) => {
      const count = getCountdown(rarity, state.slot, state.epochRemaining);
      newCounts.set(rarity.title, {
        formatted: count === null ? '?????' : formatSlotCount(count),
        raw: count,
      });
    });
    setDisplayCounts(newCounts);
  }, [estimateCurrentState]);

  // Fast tick for smooth countdown display
  useEffect(() => {
    const tickInterval = setInterval(updateDisplay, TICK_INTERVAL_MS);
    return () => clearInterval(tickInterval);
  }, [updateDisplay]);

  // Periodic fetch to rebase against actual blockchain state
  useEffect(() => {
    let mounted = true;

    const doFetch = async () => {
      const success = await fetchAndRebase();
      if (mounted && success) {
        updateDisplay();
        setLoading(false);
      } else if (mounted) {
        setLoading(false);
      }
    };

    doFetch();
    const fetchInterval = setInterval(doFetch, FETCH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(fetchInterval);
    };
  }, [fetchAndRebase, updateDisplay]);

  // Update "last updated" display
  useEffect(() => {
    const displayInterval = setInterval(() => {
      setLastUpdatedDisplay(formatLastUpdated(lastUpdated));
    }, 1000);
    return () => clearInterval(displayInterval);
  }, [lastUpdated]);

  const handleRetry = async () => {
    setLoading(true);
    const success = await fetchAndRebase();
    if (success) updateDisplay();
    setLoading(false);
  };

  const handleExcavate = async () => {
    setExcavating(true);
    try {
      // TODO: Implement excavation logic
      // - Get current slot for rarity calculation
      // - Build and send mint transaction
      // - Handle success/failure states
      console.log('Excavating Glyph');
      await excavate(umi, {
        asset: generateSigner(umi),
      }).sendAndConfirm(umi);
    } finally {
      setExcavating(false);
    }
  };

  return (
    <Container size="lg" className={classes.wrapper}>
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Excavation Countdowns
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Rarities unlock in mysterious intervals tied to Solana&apos;s blockchain rhythms.
        Each glyph&apos;s power depends on the moment you mint it—making every excavation unique.
      </Text>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Connection Error"
          color="red"
          mt="lg"
          withCloseButton
          onClose={() => setError(null)}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{error}</Text>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconRefresh size={14} />}
              onClick={handleRetry}
              loading={loading}
            >
              Retry
            </Button>
          </Group>
        </Alert>
      )}

      {lastUpdatedDisplay && !error && (
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Last updated: {lastUpdatedDisplay}
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }} spacing="xl" mt="xl">
        {RARITIES.map((rarity) => {
          const countData = displayCounts.get(rarity.title);
          const rawCount = countData?.raw ?? null;
          const isImminent = rawCount !== null && rawCount > 0 && rawCount <= IMMINENT_THRESHOLD;

          return (
            <Card
              key={rarity.title}
              shadow="md"
              radius="md"
              className={`${classes.card} ${classes[rarity.cssClass]}`}
              padding="md"
            >
              <Group gap="sm" justify="space-between">
                <Stack justify="center" h="100%">
                  <rarity.icon
                    className={classes.cardIcon}
                    style={{ width: rem(50), height: rem(50) }}
                    stroke={2}
                    aria-hidden="true"
                  />
                  <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                    {rarity.title}
                  </Text>
                </Stack>
                <Stack justify="center" h="100%">
                  <Skeleton visible={loading} radius="xl">
                    <Badge
                      size="xl"
                      w="100%"
                      variant="light"
                      className={`${classes.countdownBadge} ${isImminent ? classes.imminent : ''}`}
                      aria-label={`${rarity.title} rarity countdown: ${countData?.formatted} slots remaining`}
                    >
                      {countData?.formatted}
                    </Badge>
                  </Skeleton>
                  <Center>
                    <Text size="sm" c="dimmed">
                      Slots
                    </Text>
                  </Center>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      <Accordion
        variant="contained"
        radius="md"
        mt="xl"
        classNames={{
          item: classes.tipsAccordion,
          control: classes.tipsControl,
          panel: classes.tipsPanel,
        }}
      >
        <Accordion.Item value="tips">
          <Accordion.Control icon={<IconBulb size={20} />}>
            Excavation Tips & How It Works
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" size="lg" radius="xl" color="blue">
                  <IconClock size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={500} size="sm">Understanding Slots</Text>
                  <Text size="sm" c="dimmed">
                    Solana processes transactions in &quot;slots&quot; (~400ms each). The countdowns show how many slots remain until each rarity becomes available. Multiply by 0.4 seconds for approximate real time.
                  </Text>
                </div>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" size="lg" radius="xl" color="violet">
                  <IconTarget size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={500} size="sm">When Rarity Is Determined</Text>
                  <Text size="sm" c="dimmed">
                    Your glyph&apos;s rarity is determined by the slot when your transaction <strong>confirms on-chain</strong>—not when you click the button. This is the key to strategic excavation.
                  </Text>
                </div>
              </Group>

              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" size="lg" radius="xl" color="teal">
                  <IconRocket size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={500} size="sm">Account for Transaction Latency</Text>
                  <Text size="sm" c="dimmed">
                    Transactions typically take 2-5 seconds to confirm. For rare glyphs, click <strong>before</strong> the countdown reaches zero—aim to have your transaction confirm right as the rarity window opens.
                  </Text>
                </div>
              </Group>

              <Text size="sm" c="dimmed" mt="xs">
                <strong>Pro tip:</strong> Watch for the shimmer animation when a countdown is imminent (under 100 slots). At ~400ms per slot, 100 slots ≈ 40 seconds—plenty of time to prepare and click early.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Center mt="xl">
        <Button
          size="xl"
          radius="xl"
          className={classes.excavateButton}
          onClick={handleExcavate}
          loading={excavating}
        >
          Excavate Glyphs
        </Button>
      </Center>
    </Container>
  );
}
