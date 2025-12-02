'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { WalletProvider } from './WalletProvider';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryProvider>
  );
}