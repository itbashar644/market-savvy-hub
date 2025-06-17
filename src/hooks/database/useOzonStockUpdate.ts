
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useOzonStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    console.log('🚀 Starting Ozon stock update with products:', products.length);
    console.log('📦 Products data sample:', products.slice(0, 3));
    
    try {
      const ozonCreds = credentials['Ozon'];
      
      if (!ozonCreds?.api_key || !ozonCreds?.client_id) {
        throw new Error('Ozon API credentials not found');
      }

      if (!ozonCreds?.warehouse_id) {
        throw new Error('Ozon warehouse ID not configured');
      }

      // Логируем КАЖДЫЙ SKU отдельно для Ozon с подробными данными
      const allSkuDetails = products.map(p => {
        const offerId = p.offer_id || p.sku;
        const stock = p.stock || p.currentStock || 0;
        const productName = p.name || 'N/A';
        const category = p.category || 'N/A';
        console.log(`📋 Ozon SKU: ${offerId}, остаток: ${stock}, название: ${productName}, категория: ${category}`);
        return { 
          offerId, 
          stock, 
          productName, 
          category,
          originalData: p
        };
      });

      console.log(`📤 Отправляем ${allSkuDetails.length} SKU в Ozon API:`);
      allSkuDetails.forEach((item, index) => {
        console.log(`  ${index + 1}. SKU ${item.offerId} - остаток: ${item.stock} - ${item.productName}`);
      });

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

      console.log('📡 Ozon API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      if (result.result) {
        const successCount = result.result.filter((r: any) => r.updated).length;
        const errorCount = result.result.filter((r: any) => !r.updated).length;

        // Логируем РЕЗУЛЬТАТ для каждого SKU в Ozon с подробной информацией
        const skuResults = result.result.map((item: any) => {
          const skuDetail = allSkuDetails.find(s => s.offerId === item.offer_id);
          if (item.updated) {
            console.log(`✅ Ozon SKU ${item.offer_id}: успешно обновлен, остаток ${skuDetail?.stock} - ${skuDetail?.productName}`);
            return {
              offerId: item.offer_id,
              productName: skuDetail?.productName || 'N/A',
              category: skuDetail?.category || 'N/A',
              stock: skuDetail?.stock || 0,
              status: 'updated',
              error: null
            };
          } else {
            const errors = item.errors?.map((e: any) => e.code).join(', ') || 'Unknown error';
            console.log(`❌ Ozon SKU ${item.offer_id}: ошибка - ${errors} - ${skuDetail?.productName}`);
            return {
              offerId: item.offer_id,
              productName: skuDetail?.productName || 'N/A',
              category: skuDetail?.category || 'N/A',
              stock: skuDetail?.stock || 0,
              status: 'error',
              error: errors
            };
          }
        });

        await addSyncLog({
          marketplace: 'Ozon',
          operation: 'stock_update',
          status: 'success',
          message: `Обновление остатков Ozon: успешно ${successCount}, ошибок ${errorCount}`,
          executionTime,
          metadata: {
            updatedCount: successCount,
            errorCount: errorCount,
            productsCount: products.length,
            allSkuDetails: allSkuDetails,
            skuResults: skuResults,
            detailedResults: result.result
          }
        });

        console.log(`📊 Ozon update results: успешно ${successCount}, ошибок ${errorCount}`);
        toast.success(`✅ Остатки Ozon обновлены! (${successCount} из ${result.result.length} товаров)`, {
          description: errorCount > 0 ? `Ошибок: ${errorCount}` : 'Все товары обновлены успешно'
        });
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

      console.error('💥 Ozon stock update error:', error);
      toast.error('❌ Ошибка обновления остатков Ozon', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { updateStock };
};
