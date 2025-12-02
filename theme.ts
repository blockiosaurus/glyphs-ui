'use client';

import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  colors: {
    neonPurple: [
      '#ff66a8',
      '#ff4d9a',
      '#ff338b',
      '#ff1a7d',
      '#ff006e',
      '#e60063',
      '#cc0058',
      '#b3004d',
      '#990042',
      '#800037',
    ],
    neonBlue: [
      '#75aaff',
      '#619eff',
      '#4e92ff',
      '#3a86ff',
      '#3479e6',
      '#2e6bcc',
      '#295eb3',
      '#235099',
      '#1d4380',
      '#173666',
    ],
  },

  primaryColor: 'neonPurple',

  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',

  headings: {
    fontFamily: '"Greycliff CF", system-ui, sans-serif',
    fontWeight: '900',
    sizes: {
      h1: { fontSize: rem(44), lineHeight: '1.2' },
      h2: { fontSize: rem(34), lineHeight: '1.3' },
      h3: { fontSize: rem(24), lineHeight: '1.4' },
    },
  },

  shadows: {
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px rgba(58, 134, 255, 0.3)',
    glowStrong: '0 0 30px rgba(58, 134, 255, 0.5)',
  },

  other: {
    transitionDuration: '0.2s',
  },
});
