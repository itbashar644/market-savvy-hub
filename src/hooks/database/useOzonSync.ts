
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useOzonSync = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const syncProducts = async () => {
    const startTime = Date.now();
    
    try {
      const ozonCreds = credentials['Ozon'];
      
      if (!ozonCreds?.api_key || !ozonCreds?.client_id) {
        throw new Error('Ozon API credentials not found');
      }

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/ozon-products-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify({
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      if (result.success) {
        await addSyncLog({
          marketplace: 'Ozon',
          operation: 'product_sync',
          status: 'success',
          message: result.message || 'Синхронизация товаров завершена успешно',
          executionTime,
          metadata: {
            productsCount: result.productsCount || 0,
            updatedCount: result.updatedCount || 0,
          }
        });

        toast.success('✅ Синхронизация Ozon завершена!', {
          description: result.message
        });
      } else {
        await addSyncLog({
          marketplace: 'Ozon',
          operation: 'product_sync',
          status: 'error',
          message: result.error || 'Ошибка синхронизации товаров',
          executionTime,
          metadata: result.details || {}
        });

        toast.error('❌ Ошибка синхронизации Ozon', {
          description: result.error
        });
        throw new Error(result.error);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      await addSyncLog({
        marketplace: 'Ozon',
        operation: 'product_sync',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { error: errorMessage }
      });

      console.error('Ozon sync error:', error);
      toast.error('❌ Ошибка синхронизации Ozon', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { syncProducts };
};
