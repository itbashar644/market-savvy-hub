
import { useState, useCallback } from 'react';
import { SyncLog } from '@/types/marketplace';

export interface DetailedSyncLog extends SyncLog {
  duration?: number;
  itemsProcessed?: number;
  errors?: Array<{
    item: string;
    error: string;
  }>;
  metadata?: {
    apiKey?: string;
    warehouseId?: string;
    originalCount?: number;
    validCount?: number;
    updatedCount?: number;
    warehousesCount?: number;
  };
}

export const useSyncLogs = () => {
  const [logs, setLogs] = useState<DetailedSyncLog[]>([]);

  const addLog = useCallback((log: Omit<DetailedSyncLog, 'id' | 'timestamp'>) => {
    const newLog: DetailedSyncLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date().toLocaleString('ru-RU'),
    };

    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 50)); // Храним только последние 50 логов
  }, []);

  const addWildberriesConnectionTest = useCallback((success: boolean, error?: string, warehouseId?: string) => {
    addLog({
      marketplace: 'Wildberries',
      action: 'Проверка подключения',
      status: success ? 'success' : 'error',
      details: success 
        ? `Подключение к складу ${warehouseId} успешно установлено`
        : `Ошибка подключения: ${error}`,
      metadata: { warehouseId }
    });
  }, [addLog]);

  const addWildberriesSync = useCallback((
    success: boolean, 
    metadata?: { originalCount?: number; validCount?: number; updatedCount?: number },
    error?: string,
    duration?: number
  ) => {
    addLog({
      marketplace: 'Wildberries',
      action: 'Синхронизация товаров',
      status: success ? 'success' : 'error',
      details: success 
        ? `Синхронизировано ${metadata?.updatedCount || 0} товаров из ${metadata?.originalCount || 0}`
        : `Ошибка синхронизации: ${error}`,
      duration,
      itemsProcessed: metadata?.updatedCount,
      metadata
    });
  }, [addLog]);

  const addWildberriesStockUpdate = useCallback((
    success: boolean,
    metadata?: { originalCount?: number; validCount?: number; updatedCount?: number },
    error?: string,
    duration?: number
  ) => {
    addLog({
      marketplace: 'Wildberries',
      action: 'Обновление остатков',
      status: success ? 'success' : 'error',
      details: success 
        ? `Обновлено остатков: ${metadata?.updatedCount || 0} из ${metadata?.originalCount || 0}`
        : `Ошибка обновления остатков: ${error}`,
      duration,
      itemsProcessed: metadata?.updatedCount,
      metadata
    });
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    addWildberriesConnectionTest,
    addWildberriesSync,
    addWildberriesStockUpdate,
    clearLogs
  };
};
