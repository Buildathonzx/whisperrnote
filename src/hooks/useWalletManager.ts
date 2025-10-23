'use client';

import { useState } from 'react';
import { functions, account } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface WalletManagerState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export function useWalletManager() {
  const [state, setState] = useState<WalletManagerState>({
    loading: false,
    error: null,
    success: null
  });

  const connectWallet = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const user = await account.get();
      const userId = user.$id;

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];
      const address = accounts[0];
      if (!address) throw new Error('No wallet address available');

      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      }) as string;

      const fnId = process.env.NEXT_PUBLIC_FUNCTION_ID;
      if (!fnId) throw new Error('Wallet function not configured');

      const execution = await functions.createExecution(
        fnId,
        JSON.stringify({ userId, address, signature, message }),
        false,
        '/connect-wallet'
      );

      const execData = execution as Models.Execution;
      const response = JSON.parse(execData.responseBody || '{}');
      const statusCode = execData.responseStatusCode;

      if (statusCode !== 200) {
        throw new Error(response.error || 'Failed to connect wallet');
      }

      setState(prev => ({
        ...prev,
        success: `Wallet connected: ${address}`
      }));
      return true;

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error connecting wallet'
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnectWallet = async (): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const user = await account.get();
      
      await account.updatePrefs({
        ...user.prefs,
        walletEth: undefined
      });

      setState(prev => ({
        ...prev,
        success: 'Wallet disconnected successfully'
      }));
      return true;

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error disconnecting wallet'
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const clearMessages = () => {
    setState(prev => ({
      ...prev,
      error: null,
      success: null
    }));
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    clearMessages
  };
}
