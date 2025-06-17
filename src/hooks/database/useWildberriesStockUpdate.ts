
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        throw new Error('Wildberries API key not found');
      }

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify({ 
          products: products.map(p => ({
            nm_id: p.nm_id,
            warehouse_id: p.warehouse_id || 1,
            stock: p.stock
          })),
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
          operation: 'stock_update',
          status: 'success',
          message: result.message || 'Обновление остатков завершено успешно',
          executionTime,
          metadata: {
            updatedCount: result.updatedCount || 0,
            productsCount: products.length,
          }
        });

        toast.success('✅ Остатки Wildberries обновлены!', {
          description: result.message
        });
      } else {
        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: 'error',
          message: result.error || 'Ошибка обновления остатков',
          executionTime,
          metadata: result.details || {}
        });

        toast.error('❌ Ошибка обновления остатков Wildberries', {
          description: result.error
        });
        throw new Error(result.error);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      await addSyncLog({
        marketplace: 'Wildberries',
        operation: 'stock_update',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { error: errorMessage, productsCount: products.length }
      });

      console.error('Wildberries stock update error:', error);
      toast.error('❌ Ошибка обновления остатков Wildberries', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { updateStock };
};
