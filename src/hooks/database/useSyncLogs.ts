
import { useState, useCallback } from 'react';

export interface SyncLog {
  id?: string;
  marketplace: string;
  operation: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp?: string;
  executionTime?: number;
  metadata?: Record<string, any>;
}

export interface DetailedSyncLog extends SyncLog {
  details?: {
    apiKey?: string;
    warehouseId?: string;
    warehousesCount?: number;
    originalCount?: number;
    validCount?: number;
    updatedCount?: number;
  };
}

export const useSyncLogs = () => {
  const [logs, setLogs] = useState<DetailedSyncLog[]>([]);
  const [loading, setLoading] = useState(false);

  const addSyncLog = useCallback(async (log: SyncLog) => {
    const newLog: DetailedSyncLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]); // Keep last 100 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getLogsByMarketplace = useCallback((marketplace: string) => {
    return logs.filter(log => log.marketplace === marketplace);
  }, [logs]);

  return {
    logs,
    loading,
    addSyncLog,
    clearLogs,
    getLogsByMarketplace,
  };
};
