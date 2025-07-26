// ICPProvider: Provides ICP integration context if enabled
import React, { createContext, useContext, useMemo } from 'react';
import * as icp from '../../integrations/icp';

const ICPContext = createContext(null);

export function ICPProvider({ children }: { children: React.ReactNode }) {
  // Memoize ICP integration exports for context
  const value = useMemo(() => ({ ...icp }), []);
  return <ICPContext.Provider value={value}>{children}</ICPContext.Provider>;
}

export function useICP() {
  return useContext(ICPContext);
}
