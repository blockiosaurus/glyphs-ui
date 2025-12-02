'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useMemo, useState } from 'react';
import { Notifications } from '@mantine/notifications';
import { AppShell } from '@mantine/core';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header/Header';
import { UmiProvider } from './UmiProvider';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(new QueryClient());
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT!}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <UmiProvider>
            <QueryClientProvider client={client}>
              <ReactQueryStreamedHydration>
                <Notifications />
                <AppShell
                  header={{ height: 80 }}
                  style={{
                    backgroundColor: '#141414',
                  }}
                >
                  <AppShell.Header bg="black" withBorder={false}>
                    <Header />
                  </AppShell.Header>
                  <AppShell.Main>
                    {children}
                  </AppShell.Main>
                </AppShell>
              </ReactQueryStreamedHydration>
            </QueryClientProvider>
          </UmiProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
