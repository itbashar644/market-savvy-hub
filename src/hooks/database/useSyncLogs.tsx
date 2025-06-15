
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '../useAuth';

export interface SyncLog {
  id: string;
  marketplace: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  details: string;
  successCount?: number;
  errorCount?: number;
}

interface SyncLogsContextValue {
  logs: SyncLog[];
  addLog: (log: Omit<SyncLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const SyncLogsContext = createContext<SyncLogsContextValue | undefined>(undefined);

export const SyncLogsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const addLog = useCallback((logData: Omit<SyncLog, 'id' | 'timestamp'>) => {
    const newLog: SyncLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 49)]); // Сохраняем последние 50 логов
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const value = {
    logs,
    addLog,
    clearLogs
  };

  return (
    <SyncLogsContext.Provider value={value}>
      {children}
    </SyncLogsContext.Provider>
  );
};

export const useSyncLogs = () => {
  const context = useContext(SyncLogsContext);
  if (context === undefined) {
    throw new Error('useSyncLogs must be used within a SyncLogsProvider');
  }
  return context;
};
