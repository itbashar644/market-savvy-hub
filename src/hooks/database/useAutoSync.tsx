
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSyncLogs } from './useSyncLogs';
import { useLastSyncTimes } from './useLastSyncTimes';

interface AutoSyncContextValue {
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  syncInterval: number;
  setSyncInterval: (minutes: number) => void;
  lastAutoSync: string | null;
  onSyncFunction?: (marketplace: string) => Promise<void>;
  setOnSyncFunction: (fn: (marketplace: string) => Promise<void>) => void;
}

const AutoSyncContext = createContext<AutoSyncContextValue | undefined>(undefined);

export const AutoSyncProvider = ({ children }: { children: ReactNode }) => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30); // минуты
  const [lastAutoSync, setLastAutoSync] = useState<string | null>(null);
  const [onSyncFunction, setOnSyncFunction] = useState<((marketplace: string) => Promise<void>) | undefined>();
  const { addLog } = useSyncLogs();
  const { updateLastSync } = useLastSyncTimes();

  const performAutoSync = useCallback(async () => {
    if (!autoSyncEnabled || !onSyncFunction) return;

    const marketplaces = ['Ozon', 'Wildberries'];
    const now = new Date().toLocaleString('ru-RU');
    
    console.log('Автосинхронизация начата:', now);
    setLastAutoSync(now);
    
    for (const marketplace of marketplaces) {
      try {
        await onSyncFunction(marketplace);
        updateLastSync(marketplace);
        addLog({
          marketplace,
          action: 'Автосинхронизация остатков',
          status: 'success',
          details: `Автоматическое обновление остатков выполнено успешно`
        });
      } catch (error) {
        console.error(`Ошибка автосинхронизации ${marketplace}:`, error);
        addLog({
          marketplace,
          action: 'Автосинхронизация остатков',
          status: 'error',
          details: `Ошибка автосинхронизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        });
      }
    }
  }, [autoSyncEnabled, onSyncFunction, addLog, updateLastSync]);

  useEffect(() => {
    if (!autoSyncEnabled) return;

    const intervalMs = syncInterval * 60 * 1000;
    const interval = setInterval(performAutoSync, intervalMs);

    console.log(`Автосинхронизация настроена на ${syncInterval} минут`);

    return () => {
      clearInterval(interval);
    };
  }, [autoSyncEnabled, syncInterval, performAutoSync]);

  const value = {
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncInterval,
    setSyncInterval,
    lastAutoSync,
    onSyncFunction,
    setOnSyncFunction
  };

  return (
    <AutoSyncContext.Provider value={value}>
      {children}
    </AutoSyncContext.Provider>
  );
};

export const useAutoSync = () => {
  const context = useContext(AutoSyncContext);
  if (context === undefined) {
    throw new Error('useAutoSync must be used within a AutoSyncProvider');
  }
  return context;
};
