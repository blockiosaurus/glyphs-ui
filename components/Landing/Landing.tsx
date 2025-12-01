'use client';

import { Container, Title, Button, Group, Text, List, ThemeIcon, rem, Box, Flex, Stack, Alert, Image } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './Landing.module.css';
import RetainQueryLink from '../RetainQueryLink';
// import { FeaturesCards } from '../Create/CountdownCards';

// const links: { label: string; href: string }[] = [
//   { label: 'Mantine Docs', href: 'https://mantine.dev/' },
//   { label: 'Metaplex Docs', href: 'https://developers.metaplex.com/' },
//   { label: 'Umi Framework', href: 'https://developers.metaplex.com/umi' },
//   { label: 'Solana Digital Assets', href: 'https://developers.metaplex.com/core' },
// ];

export function Landing() {
  return (
    <>
      <div className={classes.heroSection}>
        <Container size="md" pb="xl">
          <div className={classes.inner}>
            <div className={classes.content}>
              <Title className={classes.title}>
                Uncover the Glyphs Hidden Within
              </Title>
              <Text c="dimmed" mt="md">
                Glyphs are unique digital assets that are written on the bedrock of the Solana blockchain.
                The Glyphs Quest consists of three phases: excavation, discovery, and sacrifice & summoning.
                Each phase is a unique experience that will challenge your mind and spirit.
              </Text>

              {/* <List
                mt={30}
                spacing="sm"
                size="sm"
                icon={
                  <ThemeIcon size={20} radius="xl">
                    <IconNotes style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                {links.map((link) => (
                  <List.Item key={link.href}>
                    {link.label} - <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >here
                    </a>
                  </List.Item>
                ))}
              </List> */}

            </div>
            <Image src="./hero.png" className={classes.image} />
          </div>
          <Group pb={60} mt="md">
            <RetainQueryLink href="/create">
              <Button radius="xl" size="md" className={classes.control} style={{ textShadow: '0px 0px 2px', backgroundColor: 'var(--mantine-color-neonBlue-7)' }}>
                Excavate
              </Button>
            </RetainQueryLink>
            <Link href="https://developers.metaplex.com/">
              <Button variant="default" radius="xl" size="md" className={classes.control} style={{ textShadow: '0px 0px 2px', color: 'var(--mantine-color-neonBlue-3)' }}>
                Discover
              </Button>
            </Link>
            <RetainQueryLink href="/explorer">
              <Button variant="outline" radius="xl" size="md" className={classes.control} style={{ textShadow: '0px 0px 2px', color: 'var(--mantine-color-neonBlue-3)', borderColor: 'var(--mantine-color-neonBlue-3)' }}>
                Sacrifice & Summon
              </Button>
            </RetainQueryLink>
          </Group>
        </Container>
      </div>
      <Box bg="rgb(12, 12, 12)" pb="xl" pt="md">
        {/* <FeaturesCards /> */}
        <Container size="md" py="xl" />
      </Box>
      <div style={{
        position: 'relative',
      }}
      />
    </>
  );
}
