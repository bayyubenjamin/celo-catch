'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Karena fokus ke MiniPay, kita import chain Celo
import { celo, celoAlfajores } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Celo Catch',
  projectId: '8f145c94485f139052a82d098d7875a3', // Ambil gratis di cloud.walletconnect.com
  chains: [celo, celoAlfajores],
  ssr: true, // Wajib true untuk Next.js
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
