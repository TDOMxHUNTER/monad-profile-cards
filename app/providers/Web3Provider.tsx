
'use client';

import React, { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

// Monad testnet configuration
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://testnet.monadexplorer.com/' 
    },
  },
  testnet: true,
} as const;

const config = getDefaultConfig({
  appName: 'Monad-Profile-Card-App',
  projectId: '33e4cb10d862a53d2c7115983d396508', // Generic project ID - replace with your own from cloud.reown.com
  chains: [monadTestnet],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted ? children : <div suppressHydrationWarning>{children}</div>}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
