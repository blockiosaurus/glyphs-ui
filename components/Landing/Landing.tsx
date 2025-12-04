'use client';

import { Container, Title, Text, Box } from '@mantine/core';
import Image from 'next/image';
import classes from './Landing.module.css';
import { CountdownCards } from '../Excavate/CountdownCards';

export function Landing() {
  return (
    <>
      <div className={classes.heroSection}>
        <Container size="lg" pb="xl">
          <div className={classes.inner}>
            <div className={classes.content}>
              <Title order={1} className={classes.title}>
                Uncover the Glyphs Hidden Within
              </Title>
              <Text c="dimmed" mt="md">
                Glyphs are rare NFT artifacts secured by the Solana blockchain.
                The Glyphs Quest unfolds across three mystical phases: excavation, discovery, and sacrifice & summoning.
                Each phase presents unique challenges that test both strategy and intuition.
              </Text>
            </div>
            <Image
              src="/hero.png"
              alt="Mystical crystal formation representing glyph artifacts"
              width={376}
              height={356}
              className={classes.image}
              priority
            />
          </div>
        </Container>
      </div>
      <Box bg="rgb(12, 12, 12)" pb="xl" pt="md">
        <CountdownCards />
      </Box>
    </>
  );
}
