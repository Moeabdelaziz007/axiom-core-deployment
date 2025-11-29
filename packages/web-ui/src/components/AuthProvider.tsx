'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { identityService, UserProfile } from '../services/IdentityService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, disconnect } = useWallet();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Auto-login if wallet is connected but no user session
    if (connected && publicKey && !user) {
      handleLogin(publicKey.toString());
    }
    // Auto-logout if wallet disconnects
    if (!connected && user) {
      handleLogout();
    }
  }, [connected, publicKey]);

  const handleLogin = async (walletAddress: string) => {
    try {
      const userProfile = await identityService.login(walletAddress);
      setUser(userProfile);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    identityService.logout();
    setUser(null);
    disconnect();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login: async () => {
        if (publicKey) await handleLogin(publicKey.toString());
      },
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
