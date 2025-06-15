
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LastSyncTimesContextValue {
  lastSyncTimes: Record<string, string>;
  updateLastSync: (marketplace: string) => void;
}

const LastSyncTimesContext = createContext<LastSyncTimesContextValue | undefined>(undefined);

export const LastSyncTimesProvider = ({ children }: { children: ReactNode }) => {
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({});

  const updateLastSync = useCallback((marketplace: string) => {
    const now = new Date().toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setLastSyncTimes(prev => ({
      ...prev,
      [marketplace]: now
    }));
  }, []);

  const value = {
    lastSyncTimes,
    updateLastSync
  };

  return (
    <LastSyncTimesContext.Provider value={value}>
      {children}
    </LastSyncTimesContext.Provider>
  );
};

export const useLastSyncTimes = () => {
  const context = useContext(LastSyncTimesContext);
  if (context === undefined) {
    throw new Error('useLastSyncTimes must be used within a LastSyncTimesProvider');
  }
  return context;
};
