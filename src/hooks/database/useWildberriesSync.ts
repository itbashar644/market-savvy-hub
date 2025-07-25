
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useWildberriesSync = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const syncProducts = async () => {
    const startTime = Date.now();
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        throw new Error('Wildberries API key not found');
      }

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify({
          apiKey: wbCreds.api_key
        }),
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
