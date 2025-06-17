
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

      const requestData = { 
        stocks: validProducts.map(p => {
          // Используем Wildberries SKU, а не обычный SKU
          const wbSku = p.wildberries_sku || p.nm_id;
          const mappedProduct = {
            offer_id: String(wbSku), // Wildberries требует строку
            stock: p.stock || p.currentStock || 0
          };
          console.log(`📋 Mapping product: ${p.sku || p.offer_id} -> WB SKU: ${wbSku}, stock: ${mappedProduct.stock}`);
          return mappedProduct;
        }),
        apiKey: wbCreds.api_key
      };

      console.log('📤 Making request to Wildberries stock sync function...');
      console.log('📝 Request data summary:', {
        stocksCount: requestData.stocks.length,
        apiKeyLength: requestData.apiKey ? requestData.apiKey.length : 0,
        sampleStocks: requestData.stocks.slice(0, 3)
      });

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Правильная обработка HTTP статусов
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        
        // Если 409 - это означает проблемы с товарами, а не сетевую ошибку
        if (response.status === 409) {
          console.error('🚫 Wildberries API rejected the request - все товары не найдены в каталоге');
          
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
              reason: 'All products not found in Wildberries catalog'
            }
          });

          toast.error('❌ Остатки Wildberries НЕ обновлены', {
            description: `Все товары (${validProducts.length}) не найдены в каталоге Wildberries. Проверьте правильность Wildberries SKU в инвентаре.`
          });
          
          throw new Error(`Все товары не найдены в каталоге Wildberries. HTTP статус: ${response.status}`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Response result:', result);
      
      const executionTime = Date.now() - startTime;

      // Правильная обработка ответа от API
      if (result.result && Array.isArray(result.result)) {
        const successCount = result.result.filter((item: any) => item.updated === true).length;
        const errorCount = result.result.filter((item: any) => item.updated === false).length;
        
        console.log('📊 Update results:', { successCount, errorCount, total: result.result.length });

        // Критическая проверка: если НЕТ УСПЕШНЫХ обновлений - это ошибка!
        const isCompleteFailure = successCount === 0;
        const status = isCompleteFailure ? 'error' : (successCount > 0 ? 'success' : 'error');

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
            details: result.result
          }
        });

        if (isCompleteFailure) {
          // Показываем детальную информацию о том, почему товары не найдены
          const notFoundItems = result.result.filter((item: any) => 
            item.updated === false && 
            item.errors?.some((err: any) => err.code === 'NotFound' || err.code === 'SKU_NOT_FOUND')
          );
          
          console.log('❌ Товары не найдены в каталоге Wildberries:', notFoundItems.length);
          console.log('📋 Примеры не найденных WB SKU:', notFoundItems.slice(0, 5).map(item => item.offer_id));
          
          toast.error('❌ Остатки Wildberries НЕ обновлены', {
            description: `НИ ОДИН товар не был найден в каталоге Wildberries (${errorCount} товаров). Убедитесь, что у товаров правильно заполнены Wildberries SKU.`
          });
          
          throw new Error(`Ни один товар не был обновлен в Wildberries. Все ${errorCount} товаров не найдены в каталоге.`);
        } else if (successCount > 0) {
          toast.success(`✅ Остатки Wildberries обновлены! (${successCount} из ${result.result.length} товаров)`, {
            description: errorCount > 0 ? `Ошибок: ${errorCount}` : 'Все товары обновлены успешно'
          });
        }

        // Показываем детали ошибок для товаров, которые не удалось обновить
        if (errorCount > 0 && !isCompleteFailure) {
          const errorItems = result.result.filter((item: any) => item.updated === false);
          console.log('❌ Товары с ошибками:', errorItems.slice(0, 10));
          
          // Группируем ошибки по типам
          const errorGroups = errorItems.reduce((acc: any, item: any) => {
            if (item.errors && item.errors.length > 0) {
              const errorCode = item.errors[0].code || 'UNKNOWN_ERROR';
              if (!acc[errorCode]) acc[errorCode] = [];
              acc[errorCode].push(item.offer_id);
            }
            return acc;
          }, {});

          Object.entries(errorGroups).forEach(([errorCode, offerIds]: [string, any]) => {
            console.log(`❌ ${errorCode}: ${offerIds.slice(0, 5).join(', ')}${offerIds.length > 5 ? '...' : ''}`);
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
        metadata: { error: errorMessage, productsCount: products.length }
      });

      console.error('📝 Logged error to sync logs');
      
      // Не показываем toast.error здесь если уже показали выше
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
