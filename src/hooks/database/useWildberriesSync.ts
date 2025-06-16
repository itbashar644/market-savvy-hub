
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';

export const useWildberriesSync = () => {
  const { addSyncLog } = useSyncLogs();

  const syncProducts = async () => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      if (result.success) {
        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_sync',
          status: 'success',
          message: result.message || 'Синхронизация завершена успешно',
          executionTime,
          metadata: {
            warehousesCount: result.warehousesCount || 0,
            originalCount: result.originalCount || 0,
            validCount: result.validCount || 0,
            updatedCount: result.updatedCount || 0,
          }
        });

        toast.success('✅ Синхронизация Wildberries завершена!', {
          description: result.message
        });
      } else {
        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_sync',
          status: 'error',
          message: result.error || 'Ошибка синхронизации',
          executionTime,
          metadata: result.details || {}
        });

        toast.error('❌ Ошибка синхронизации Wildberries', {
          description: result.error
        });
        throw new Error(result.error);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      await addSyncLog({
        marketplace: 'Wildberries',
        operation: 'stock_sync',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { error: errorMessage }
      });

      console.error('Wildberries sync error:', error);
      toast.error('❌ Ошибка синхронизации Wildberries', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { syncProducts };
};
