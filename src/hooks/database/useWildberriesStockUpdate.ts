
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    console.log('🚀 [FRONTEND] ===== НАЧАЛО ОБНОВЛЕНИЯ ОСТАТКОВ WB =====');
    console.log('🚀 [FRONTEND] Получено товаров для обновления:', products.length);
    console.log('🚀 [FRONTEND] Пример товаров:', products.slice(0, 3));
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        const errorMsg = 'Wildberries API key not found. Проверьте настройки подключения.';
        console.error('❌ [FRONTEND]', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('🔑 [FRONTEND] Wildberries API key найден');
      console.log('🔑 [FRONTEND] API key (первые 10 символов):', wbCreds.api_key.substring(0, 10) + '...');

      // Фильтруем и правильно маппим товары с Wildberries SKU
      console.log('📋 [FRONTEND] Начинаем фильтрацию товаров...');
      
      const validProducts = [];
      const invalidProducts = [];
      
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        console.log(`📋 [FRONTEND] Товар ${i + 1}/${products.length}:`, {
          sku: p.sku,
          offer_id: p.offer_id,  
          wildberries_sku: p.wildberries_sku,
          nm_id: p.nm_id,
          stock: p.stock,
          currentStock: p.currentStock,
          name: p.name
        });
        
        const hasWbSku = p.wildberries_sku || p.nm_id || p.offer_id;
        if (!hasWbSku) {
          console.log(`⚠️ [FRONTEND] Пропускаем товар ${p.sku} - нет Wildberries SKU`);
          invalidProducts.push(p);
        } else {
          console.log(`✅ [FRONTEND] Товар ${p.sku} валиден, WB SKU: ${hasWbSku}`);
          validProducts.push(p);
        }
      }

      console.log(`📊 [FRONTEND] Результат фильтрации: валидных ${validProducts.length}, невалидных ${invalidProducts.length}`);

      if (validProducts.length === 0) {
        console.log('❌ [FRONTEND] Нет товаров с Wildberries SKU для обновления');
        toast.error('❌ Нет товаров с Wildberries SKU для обновления остатков');
        return;
      }

      // Подготавливаем данные для отправки
      console.log('📤 [FRONTEND] Подготавливаем данные для Edge Function...');
      
      const requestData = { 
        stocks: validProducts.map((p, index) => {
          const wbSku = p.wildberries_sku || p.nm_id || p.offer_id;
          const stock = p.stock || p.currentStock || 0;
          
          const stockItem = {
            offer_id: String(wbSku),
            stock: stock
          };
          
          console.log(`📤 [FRONTEND] Товар ${index + 1}: offer_id=${stockItem.offer_id}, stock=${stockItem.stock}`);
          return stockItem;
        }),
        apiKey: wbCreds.api_key
      };

      console.log('📤 [FRONTEND] Итоговые данные для отправки:');
      console.log(JSON.stringify(requestData, null, 2));

      console.log('🌐 [FRONTEND] Отправляем запрос в Edge Function...');
      console.log('🌐 [FRONTEND] URL: https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync');

      const fetchStartTime = Date.now();
      
      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
        body: JSON.stringify(requestData),
      });

      const fetchTime = Date.now() - fetchStartTime;
      console.log(`🌐 [FRONTEND] Время запроса: ${fetchTime}ms`);
      console.log('🌐 [FRONTEND] Статус ответа:', response.status, response.statusText);
      console.log('🌐 [FRONTEND] Headers ответа:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FRONTEND] HTTP ошибка:', response.status, response.statusText);
        console.error('❌ [FRONTEND] Тело ошибки:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('📨 [FRONTEND] Получен ответ от Edge Function:');
      console.log(JSON.stringify(result, null, 2));
      
      const executionTime = Date.now() - startTime;
      console.log(`⏱️ [FRONTEND] Общее время выполнения: ${executionTime}ms`);

      if (result.result && Array.isArray(result.result)) {
        const successCount = result.result.filter((item: any) => item.updated === true).length;
        const errorCount = result.result.filter((item: any) => item.updated === false).length;
        
        console.log('📊 [FRONTEND] Статистика обновления:', { 
          total: result.result.length,
          successCount, 
          errorCount 
        });

        // Детальный анализ каждого результата
        result.result.forEach((item: any, index: number) => {
          if (item.updated) {
            console.log(`✅ [FRONTEND] Товар ${index + 1}: SKU ${item.offer_id} успешно обновлен`);
          } else {
            const errors = item.errors?.map((e: any) => e.message || e.code).join(', ') || 'Неизвестная ошибка';
            console.log(`❌ [FRONTEND] Товар ${index + 1}: SKU ${item.offer_id} НЕ обновлен. Ошибки: ${errors}`);
          }
        });

        const isCompleteFailure = successCount === 0;
        const status = isCompleteFailure ? 'error' : 'success';

        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: status,
          message: isCompleteFailure 
            ? `❌ НИ ОДИН товар не был обновлен (${errorCount} ошибок)`
            : `✅ Обновлено: ${successCount}, ошибок: ${errorCount}`,
          executionTime,
          metadata: {
            updatedCount: successCount,
            errorCount: errorCount,
            productsCount: validProducts.length,
            filteredOutCount: products.length - validProducts.length,
            detailedResults: result.result,
            requestData: requestData
          }
        });

        if (isCompleteFailure) {
          console.error('💥 [FRONTEND] КРИТИЧЕСКАЯ ОШИБКА: НИ ОДИН товар не обновлен!');
          
          // Показываем детальную информацию об ошибках
          const errorSummary = result.result.reduce((acc: any, item: any) => {
            if (!item.updated && item.errors) {
              item.errors.forEach((error: any) => {
                const code = error.code || 'UNKNOWN';
                acc[code] = (acc[code] || 0) + 1;
              });
            }
            return acc;
          }, {});
          
          console.error('💥 [FRONTEND] Типы ошибок:', errorSummary);
          
          toast.error('❌ Остатки Wildberries НЕ обновлены!', {
            description: `НИ ОДИН товар не найден в каталоге (${errorCount} товаров). Проверьте правильность SKU в личном кабинете WB.`
          });
          
          throw new Error(`Ни один товар не был обновлен. Все ${errorCount} товаров содержат ошибки.`);
        } else {
          console.log('🎉 [FRONTEND] УСПЕХ! Часть товаров обновлена успешно');
          
          toast.success(`✅ Остатки Wildberries частично обновлены!`, {
            description: `Обновлено: ${successCount} из ${result.result.length} товаров${errorCount > 0 ? `, ошибок: ${errorCount}` : ''}`
          });
        }
      } else if (result.error) {
        console.error('💥 [FRONTEND] Edge Function вернул ошибку:', result.error);
        throw new Error(result.error);
      } else {
        console.error('💥 [FRONTEND] Неправильный формат ответа:', result);
        throw new Error('Неправильный формат ответа от API');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      console.error('💥 [FRONTEND] ===== КРИТИЧЕСКАЯ ОШИБКА =====');
      console.error('💥 [FRONTEND] Тип:', typeof error);
      console.error('💥 [FRONTEND] Название:', error instanceof Error ? error.name : 'Unknown');
      console.error('💥 [FRONTEND] Сообщение:', errorMessage);
      console.error('💥 [FRONTEND] Stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('💥 [FRONTEND] Полный объект:', error);
      
      await addSyncLog({
        marketplace: 'Wildberries',
        operation: 'stock_update',
        status: 'error',
        message: errorMessage,
        executionTime,
        metadata: { 
          error: errorMessage, 
          productsCount: products.length,
          errorDetails: error instanceof Error ? error.stack : undefined,
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      });

      if (!errorMessage.includes('не найдены в каталоге') && !errorMessage.includes('не был обновлен')) {
        toast.error('❌ Критическая ошибка обновления остатков Wildberries', {
          description: errorMessage
        });
      }
      throw error;
    }
  };

  return { updateStock };
};
