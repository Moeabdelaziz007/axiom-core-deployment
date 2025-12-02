import { apiClient } from './client';

export interface WalletAccount {
  address: string;
  balance: number;
  network: 'mainnet' | 'devnet' | 'testnet';
  verified: boolean;
}

export interface WalletAuthRequest {
  publicKey: string;
  signature: string;
  message: string;
}

export interface WalletAuthResponse {
  success: boolean;
  token: string;
  account: WalletAccount;
}

// Wallet Service API
export const walletService = {
  // Authenticate wallet
  authenticateWallet: async (request: WalletAuthRequest): Promise<WalletAuthResponse> => {
    const response = await apiClient.post<WalletAuthResponse>('/wallet/auth', request);
    return response.data;
  },

  // Get wallet account details
  getWalletAccount: async (publicKey: string): Promise<WalletAccount> => {
    const response = await apiClient.get<WalletAccount>(`/wallet/account/${publicKey}`);
    return response.data;
  },

  // Get wallet balance
  getWalletBalance: async (publicKey: string): Promise<{ balance: number }> => {
    const response = await apiClient.get(`/wallet/balance/${publicKey}`);
    return response.data;
  },

  // Disconnect wallet
  disconnectWallet: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/wallet/disconnect');
    return response.data;
  },
};