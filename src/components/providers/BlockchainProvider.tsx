import React, { createContext, useContext, useEffect, useState } from 'react';
import { Identity } from '@dfinity/agent';
import { ICPAuth } from '@/lib/icp/auth';
import { ICPClient } from '@/lib/icp/client';

interface BlockchainContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  client: ICPClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const BlockchainContext = createContext<BlockchainContextType>({
  isAuthenticated: false,
  identity: null,
  client: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [client, setClient] = useState<ICPClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auth] = useState(() => new ICPAuth());

  useEffect(() => {
    const initialize = async () => {
      try {
        const isAuthed = await auth.init();
        if (isAuthed) {
          const identity = await auth.getIdentity();
          setIdentity(identity);
          setClient(new ICPClient(identity));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [auth]);

  const login = async () => {
    try {
      const identity = await auth.login();
      setIdentity(identity);
      setClient(new ICPClient(identity));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setIdentity(null);
      setClient(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <BlockchainContext.Provider 
      value={{
        isAuthenticated,
        identity,
        client,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => useContext(BlockchainContext);