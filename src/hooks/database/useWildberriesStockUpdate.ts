
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    console.log('🚀 Starting Wildberries stock update with products:', products.length);
    console.log('📦 Products data sample:', products.slice(0, 3));
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        const errorMsg = 'Wildberries API key not found. Проверьте настройки подключения.';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('🔑 Wildberries API key found, preparing request...');

      // Фильтруем и правильно маппим товары с Wildberries SKU
      const validProducts = products.filter(p => {
        const hasWbSku = p.wildberries_sku || p.nm_id;
        if (!hasWbSku) {
          console.log(`⚠️ Пропускаем товар ${p.sku || p.offer_id} - нет Wildberries SKU`);
        }
        return hasWbSku;
      });

      if (validProducts.length === 0) {
        console.log('❌ Нет товаров с Wildberries SKU для обновления');
        toast.error('❌ Нет товаров с Wildberries SKU для обновления остатков');
        return;
      }

      console.log(`📋 Товары для обновления: ${validProducts.length} из ${products.length}`);

      // Логируем КАЖДЫЙ SKU отдельно с подробными данными
      const allSkuDetails = validProducts.map(p => {
        const wbSku = p.wildberries_sku || p.nm_id;
        const stock = p.stock || p.currentStock || 0;
        const originalSku = p.sku || p.offer_id;
        console.log(`📋 WB SKU: ${wbSku}, исходный SKU: ${originalSku}, остаток: ${stock}, название: ${p.name || 'N/A'}`);
        return { 
          wbSku, 
          originalSku, 
          stock, 
          productName: p.name || 'N/A',
          category: p.category || 'N/A'
        };
      });

      console.log(`📤 Отправляем ${allSkuDetails.length} SKU в Wildberries API:`);
      allSkuDetails.forEach((item, index) => {
        console.log(`  ${index + 1}. SKU ${item.wbSku} (${item.originalSku}) - остаток: ${item.stock} - ${item.productName}`);
      });

      const requestData = { 
        stocks: validProducts.map(p => {
          const wbSku = p.wildberries_sku || p.nm_id;
          return {
            offer_id: String(wbSku),
            stock: p.stock || p.currentStock || 0
          };
        }),
        apiKey: wbCreds.api_key
      };

      console.log('📤 Making request to Wildberries stock sync function...');

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        
        if (response.status === 409) {
          console.error('🚫 Wildberries API rejected the request - товары не найдены в каталоге');
          
          // Создаем детальные результаты для всех SKU при 409 ошибке
          const skuResults = allSkuDetails.map(sku => {
            console.log(`❌ SKU ${sku.wbSku} (исходный: ${sku.originalSku}): NotFound в каталоге Wildberries - ${sku.productName}`);
            return {
              wbSku: sku.wbSku,
              originalSku: sku.originalSku,
              productName: sku.productName,
              stock: sku.stock,
              status: 'NotFound',
              error: 'Товар не найден в каталоге Wildberries'
            };
          });
          
          await addSyncLog({
            marketplace: 'Wildberries',
            operation: 'stock_update',
            status: 'error',
            message: `Все товары не найдены в каталоге Wildberries (${validProducts.length} товаров)`,
            executionTime: Date.now() - startTime,
            metadata: {
              updatedCount: 0,
              errorCount: validProducts.length,
              productsCount: validProducts.length,
              httpStatus: response.status,
              allSkuDetails: allSkuDetails,
              skuResults: skuResults,
              reason: 'All products not found in Wildberries catalog',
              detailedError: errorText
            }
          });

          toast.error('❌ Остатки Wildberries НЕ обновлены', {
            description: `Все товары (${validProducts.length}) не найдены в каталоге Wildberries. Проверьте правильность SKU.`
          });
          
          throw new Error(`Все товары не найдены в каталоге Wildberries. HTTP статус: ${response.status}`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Response result:', result);
      
      const executionTime = Date.now() - startTime;

      if (result.result && Array.isArray(result.result)) {
        const successCount = result.result.filter((item: any) => item.updated === true).length;
        const errorCount = result.result.filter((item: any) => item.updated === false).length;
        
        console.log('📊 Update results:', { successCount, errorCount, total: result.result.length });

        // Создаем детальные результаты для каждого SKU
        const skuResults = result.result.map((item: any) => {
          const skuDetail = allSkuDetails.find(s => s.wbSku === item.offer_id);
          if (item.updated) {
            console.log(`✅ SKU ${item.offer_id} (исходный: ${skuDetail?.originalSku}): успешно обновлен, остаток ${skuDetail?.stock} - ${skuDetail?.productName}`);
            return {
              wbSku: item.offer_id,
              originalSku: skuDetail?.originalSku || 'N/A',
              productName: skuDetail?.productName || 'N/A',
              stock: skuDetail?.stock || 0,
              status: 'updated',
              error: null
            };
          } else {
            const errors = item.errors?.map((e: any) => e.code || e.message).join(', ') || 'Unknown error';
            console.log(`❌ SKU ${item.offer_id} (исходный: ${skuDetail?.originalSku}): ошибка - ${errors} - ${skuDetail?.productName}`);
            return {
              wbSku: item.offer_id,
              originalSku: skuDetail?.originalSku || 'N/A', 
              productName: skuDetail?.productName || 'N/A',
              stock: skuDetail?.stock || 0,
              status: 'error',
              error: errors
            };
          }
        });

        const isCompleteFailure = successCount === 0;
        const status = isCompleteFailure ? 'error' : 'success';

        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: status,
          message: isCompleteFailure 
            ? `НИ ОДИН товар не был обновлен в Wildberries (${errorCount} ошибок)`
            : `Обновлено: ${successCount}, ошибок: ${errorCount}`,
          executionTime,
          metadata: {
            updatedCount: successCount,
            errorCount: errorCount,
            productsCount: validProducts.length,
            filteredOutCount: products.length - validProducts.length,
            allSkuDetails: allSkuDetails,
            skuResults: skuResults,
            detailedResults: result.result,
            details: result.result
          }
        });

        if (isCompleteFailure) {
          toast.error('❌ Остатки Wildberries НЕ обновлены', {
            description: `НИ ОДИН товар не был найден в каталоге Wildberries (${errorCount} товаров). Проверьте настройки интеграции.`
          });
          
          throw new Error(`Ни один товар не был обновлен в Wildberries. Все ${errorCount} товаров не найдены в каталоге.`);
        } else {
          toast.success(`✅ Остатки Wildberries обновлены! (${successCount} из ${result.result.length} товаров)`, {
            description: errorCount > 0 ? `Ошибок: ${errorCount}` : 'Все товары обновлены успешно'
          });
        }
      } else {
        throw new Error('Неправильный формат ответа от API');
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
