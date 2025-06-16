
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/functions/v1/wildberries-stock-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
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
