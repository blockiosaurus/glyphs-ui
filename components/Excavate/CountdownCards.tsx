import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  rem,
  useMantineTheme,
  Badge,
  Group,
  Stack,
  Center,
} from '@mantine/core';
import { IconCircleDot, IconSun, IconInfinity, IconTallymark4, IconPuzzle2, IconSkull, IconCircleRectangle, IconPrism } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useInterval } from '@mantine/hooks';
import { Umi } from '@metaplex-foundation/umi';
import classes from './CountdownCards.module.css';
import { useUmi } from '@/providers/useUmi';

const initialData = [
  {
    title: 'Stone',
    icon: IconCircleDot,
  },
  {
    title: 'Jade',
    icon: IconCircleRectangle,
  },
  {
    title: 'Bronze',
    icon: IconPrism,
  },
  {
    title: 'Silver',
    icon: IconPuzzle2,
  },
  {
    title: 'Gold',
    icon: IconSun,
  },
  {
    title: 'Obsidian',
    icon: IconInfinity,
  },
  {
    title: 'Neon',
    icon: IconTallymark4,
  },
  {
    title: 'Necrotic',
    icon: IconSkull,
  },
];

interface EpochInfo {
  slotsInEpoch: number;
  slotIndex: number;
}

function calcSlotsUntil(currentSlot: number, powerOfTwo: number): number {
  const nextPowerOfTwo = 2 ** powerOfTwo;
  return nextPowerOfTwo - (currentSlot % nextPowerOfTwo);
}

async function getSlotsUntilNextEpoch(umi: Umi): Promise<number> {
  const epochInfo: EpochInfo = await umi.rpc.call('getEpochInfo');
  return epochInfo.slotsInEpoch - epochInfo.slotIndex;
}

function numberToString(value: number): string {
  if (value > 1e6) {
    return `${(value / 1e6).toFixed(1)}m`;
  }
  return value.toString();
}

export function CountdownCards() {
  const theme = useMantineTheme();
  const umi = useUmi();
  const [data, setData] = useState(initialData);
  const [countdowns, setCountdowns] = useState<Map<string, string>>(new Map([
    ['Stone', numberToString(1)],
    ['Jade', numberToString(0)],
    ['Bronze', numberToString(0)],
    ['Silver', numberToString(0)],
    ['Gold', numberToString(0)],
    ['Obsidian', numberToString(0)],
    ['Neon', numberToString(0)],
    ['Necrotic', '?????'],
  ]));

  // const features = ;

  useEffect(() => {
    const dataWithCountdowns = initialData.map((feature) => ({
      title: feature.title,
      icon: feature.icon,
      countdown: countdowns.get(feature.title),
    }));

    setData(dataWithCountdowns);
  }, [countdowns]);

  const fetchAndUpdate = useCallback(async () => {
    const currentSlot = await umi.rpc.getSlot();
    const slotsUntilNextEpoch = await getSlotsUntilNextEpoch(umi);
    return new Map([
      ['Stone', numberToString(1)],
      ['Jade', numberToString(calcSlotsUntil(currentSlot, 10))],
      ['Bronze', numberToString(slotsUntilNextEpoch)],
      ['Silver', numberToString(calcSlotsUntil(currentSlot, 20))],
      ['Gold', numberToString(calcSlotsUntil(currentSlot, 22))],
      ['Obsidian', numberToString(calcSlotsUntil(currentSlot, 24))],
      ['Neon', numberToString(calcSlotsUntil(currentSlot, 26))],
      ['Necrotic', '?????'],
    ]);
  }, [setCountdowns, umi]);

  const interval = useInterval(() => {
    fetchAndUpdate().then((map) => setCountdowns(map));
  }, 5000);

  useEffect(() => {
    fetchAndUpdate();
    interval.start();
    return interval.stop;
  }, [fetchAndUpdate]);

  return (
    <Container size="lg" className={classes.wrapper}>
      {/* <Group justify="center">
        <Badge variant="filled" size="lg">
          Best company ever
        </Badge>
      </Group> */}

      <Title order={1} className={classes.title} ta="center" mt="sm">
        Glyph Excavation Countdowns
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Minting uses the Glyph minting program which introduces specialized logic for generating and minting NFTs with rarities based on current Slot and Epoch. Custom logic is inspired by the Sat rarity concept implemented on Bitcoin.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 4 }} spacing="xl" mt={50}>
        {data.map((feature) => (
          <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="md">
            <Group gap="sm" justify="space-between">
              <Stack justify="center" h="100%">
                <feature.icon
                  style={{ width: rem(50), height: rem(50) }}
                  stroke={2}
                  color={theme.colors.neonBlue[6]}
                />
                <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                  {feature.title}
                </Text>
              </Stack>
              <Stack justify="center" h="100%">
                <Badge size="xl" w="100%">
                  {/* <Title order={5}> */}
                  {countdowns.get(feature.title)}
                  {/* </Title> */}
                </Badge>
                <Center>
                  <Title order={5} c="dimmed">
                    Slots
                  </Title>
                </Center>
              </Stack>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
