import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBlockchainServices } from '../../lib/blockchain';
import type { BlockchainService, NoteSharing } from '../../lib/blockchain/types';

interface BlockchainContextType {
  blockchain: BlockchainService;
  sharing: NoteSharing;
  isInitialized: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export const BlockchainProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [services, setServices] = useState<BlockchainContextType | null>(null);

  useEffect(() => {
    const initServices = async () => {
      const { blockchain, sharing } = useBlockchainServices();
      setServices({
        blockchain,
        sharing,
        isInitialized: true
      });
    };

    initServices();
  }, []);

  if (!services) {
    return <div>Initializing blockchain services...</div>;
  }

  return (
    <BlockchainContext.Provider value={services}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
};