
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';
import { useWildberriesStockValidator, ProductForUpdate } from '../marketplace/useWildberriesStockValidator';
import { useWildberriesApiClient, SkuUpdateResult } from '../marketplace/useWildberriesApiClient';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();
  const { validateAndFilterProducts } = useWildberriesStockValidator();
  const { updateStocksApi } = useWildberriesApiClient();

  const createDetailedLog = async (
    validProducts: any[],
    skuResults: SkuUpdateResult[],
    executionTime: number,
    isError: boolean = false,
    errorMessage?: string
  ) => {
    const successCount = skuResults.filter(r => r.status === 'updated').length;
    const errorCount = skuResults.filter(r => r.status !== 'updated').length;
    const isCompleteFailure = successCount === 0;

    await addSyncLog({
      marketplace: 'Wildberries',
      operation: 'stock_update',
      status: isError || isCompleteFailure ? 'error' : 'success',
      message: isError 
        ? errorMessage || 'Ошибка обновления остатков'
        : isCompleteFailure 
          ? `НИ ОДИН товар не был обновлен в Wildberries (${errorCount} ошибок)`
          : `Обновлено: ${successCount}, ошибок: ${errorCount}`,
      executionTime,
      metadata: {
        updatedCount: successCount,
        errorCount: errorCount,
        productsCount: validProducts.length,
        skuResults: skuResults,
        detailedResults: skuResults
      }
    });
  };

  const updateStock = async (products: ProductForUpdate[]) => {
    const startTime = Date.now();
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        const errorMsg = 'Wildberries API key not found. Проверьте настройки подключения.';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('🔑 Wildberries API key found, preparing request...');

      const { validProducts, invalidCount } = validateAndFilterProducts(products);

      if (validProducts.length === 0) {
        console.log('❌ Нет товаров с Wildberries SKU для обновления');
        toast.error('❌ Нет товаров с Wildberries SKU для обновления остатков');
        
        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: 'error',
          message: 'Нет товаров с Wildberries SKU для обновления',
          executionTime: Date.now() - startTime,
          metadata: {
            updatedCount: 0,
            errorCount: 0,
            productsCount: products.length,
            filteredOutCount: invalidCount
          }
        });
        return;
      }

      const skuResults = await updateStocksApi(validProducts, wbCreds.api_key);
      const executionTime = Date.now() - startTime;

      await createDetailedLog(validProducts, skuResults, executionTime);

      const successCount = skuResults.filter(r => r.status === 'updated').length;
      const errorCount = skuResults.filter(r => r.status !== 'updated').length;
      const isCompleteFailure = successCount === 0;

      if (isCompleteFailure) {
        toast.error('❌ Остатки Wildberries НЕ обновлены', {
          description: `НИ ОДИН товар не был найден в каталоге Wildberries (${errorCount} товаров). Проверьте настройки интеграции.`
        });
        
        throw new Error(`Ни один товар не был обновлен в Wildberries. Все ${errorCount} товаров не найдены в каталоге.`);
      } else {
        toast.success(`✅ Остатки Wildberries обновлены! (${successCount} из ${skuResults.length} товаров)`, {
          description: errorCount > 0 ? `Ошибок: ${errorCount}` : 'Все товары обновлены успешно'
        });
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      console.error('💥 Wildberries stock update error:', error);
      
      await addSyncLog({
        marketplace: 'Wildberries',
        operation: 'stock_update',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { 
          error: errorMessage, 
          productsCount: products.length,
          errorDetails: error instanceof Error ? error.stack : undefined
        }
      });

      if (!errorMessage.includes('не найдены в каталоге')) {
        toast.error('❌ Ошибка обновления остатков Wildberries', {
          description: errorMessage
        });
      }
      throw error;
    }
  };

  return { updateStock };
};
