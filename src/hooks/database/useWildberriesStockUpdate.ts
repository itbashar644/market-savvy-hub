
import { toast } from 'sonner';
import { useSyncLogs } from './useSyncLogs';
import { useMarketplaceCredentials } from './useMarketplaceCredentials';

export const useWildberriesStockUpdate = () => {
  const { addSyncLog } = useSyncLogs();
  const { credentials } = useMarketplaceCredentials();

  const updateStock = async (products: any[]) => {
    const startTime = Date.now();
    
    console.log('🚀 Starting Wildberries stock update with products:', products.length);
    console.log('📦 Products data:', products);
    
    try {
      const wbCreds = credentials['Wildberries'];
      
      if (!wbCreds?.api_key) {
        const errorMsg = 'Wildberries API key not found. Проверьте настройки подключения.';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('🔑 Wildberries API key found, preparing request...');

      const requestData = { 
        stocks: products.map(p => {
          const mappedProduct = {
            offer_id: p.sku,
            stock: p.stock
          };
          console.log('📋 Mapping product:', p.sku || p.offer_id, '->', mappedProduct);
          return mappedProduct;
        }),
        apiKey: wbCreds.api_key
      };

      console.log('📤 Making request to Wildberries stock sync function...');
      console.log('📝 Request data summary:', {
        stocksCount: requestData.stocks.length,
        apiKeyLength: requestData.apiKey ? requestData.apiKey.length : 0
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Response result:', result);
      
      const executionTime = Date.now() - startTime;

      if (result.result && Array.isArray(result.result)) {
        // Подсчитываем успешные и неуспешные обновления
        const successCount = result.result.filter((item: any) => item.updated === true).length;
        const errorCount = result.result.filter((item: any) => item.updated === false).length;
        
        console.log('📊 Update results:', { successCount, errorCount, total: result.result.length });

        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: successCount > 0 ? 'success' : 'error',
          message: `Обновлено: ${successCount}, ошибок: ${errorCount}`,
          executionTime,
          metadata: {
            updatedCount: successCount,
            errorCount: errorCount,
            productsCount: products.length,
            details: result.result
          }
        });

        if (successCount > 0) {
          toast.success(`✅ Остатки Wildberries обновлены! (${successCount} из ${result.result.length} товаров)`, {
            description: errorCount > 0 ? `Ошибок: ${errorCount}` : 'Все товары обновлены успешно'
          });
        } else {
          toast.error('❌ Не удалось обновить остатки на Wildberries', {
            description: `Ошибок: ${errorCount} из ${result.result.length} товаров`
          });
        }

        // Показываем детали ошибок, если есть
        if (errorCount > 0) {
          const errorItems = result.result.filter((item: any) => item.updated === false);
          console.log('❌ Товары с ошибками:', errorItems);
          
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
            console.log(`❌ ${errorCode}: ${offerIds.join(', ')}`);
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
      
      toast.error('❌ Ошибка обновления остатков Wildberries', {
        description: errorMessage
      });
      throw error;
    }
  };

  return { updateStock };
};
