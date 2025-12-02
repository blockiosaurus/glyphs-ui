'use client';

import Link from 'next/link';
import { Container, Flex, Group, Title, Image, Burger, Drawer, Stack, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import classes from './Header.module.css';

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <Container size="xl" h={80} pt={12}>
        <div className={classes.inner}>
          <Flex justify="center" align="center" gap="md">
            <Link href="/">
              <Image src="/logo.png" w={64} alt="Glyphs Quest logo" />
            </Link>
            <Title order={2} className={classes.title}>Glyphs Quest</Title>
          </Flex>

          {/* Desktop Navigation */}
          <Group className={classes.desktopNav}>
            <WalletMultiButton />
          </Group>

          {/* Mobile Burger */}
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.burger}
            aria-label="Toggle navigation menu"
          />
        </div>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.drawer}
        zIndex={1000}
      >
        <Stack gap="lg">
          <Box>
            <WalletMultiButton />
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
