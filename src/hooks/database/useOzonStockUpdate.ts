
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useOzonStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    try {
      const ozonCreds = credentials.find(c => c.marketplace === 'Ozon');
      
      if (!ozonCreds?.api_key || !ozonCreds?.client_id) {
        throw new Error('Ozon API credentials not found');
      }

      if (!ozonCreds?.warehouse_id) {
        throw new Error('Ozon warehouse ID not configured');
      }

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/ozon-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify({
          stocks: products.map(p => ({
            offer_id: p.offer_id || p.sku,
            stock: p.stock
          })),
          warehouseId: parseInt(ozonCreds.warehouse_id),
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      if (result.result) {
        await addSyncLog({
          marketplace: 'Ozon',
          operation: 'stock_update',
          status: 'success',
          message: `Обновление остатков завершено успешно`,
          executionTime,
          metadata: {
            updatedCount: result.result.filter((r: any) => r.updated).length,
            productsCount: products.length,
          }
        });

        toast.success('✅ Остатки Ozon обновлены!');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      await addSyncLog({
        marketplace: 'Ozon',
        operation: 'stock_update',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { error: errorMessage, productsCount: products.length }
      });

      console.error('Ozon stock update error:', error);
      toast.error('❌ Ошибка обновления остатков Ozon', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { updateStock };
};
