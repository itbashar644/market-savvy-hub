
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
        products: products.map(p => {
          const mappedProduct = {
            nm_id: p.nm_id,
            warehouse_id: p.warehouse_id || 1,
            stock: p.stock
          };
          console.log('📋 Mapping product:', p.sku || p.offer_id, '->', mappedProduct);
          return mappedProduct;
        }),
        apiKey: wbCreds.api_key
      };

      console.log('📤 Making request to Wildberries stock update function...');
      console.log('📝 Request data summary:', {
        productsCount: requestData.products.length,
        apiKeyLength: requestData.apiKey ? requestData.apiKey.length : 0
      });

      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-stock-update', {
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
            details: result.details || {}
          }
        });

        console.log('✅ Stock update successful:', result.message);
        console.log('📊 Updated count:', result.updatedCount);
        
        if (result.updatedCount > 0) {
          toast.success(`✅ Остатки Wildberries обновлены! (${result.updatedCount} товаров)`, {
            description: result.message
          });
        } else {
          toast.warning('⚠️ Остатки отправлены, но обновлений не произошло', {
            description: 'Возможно, остатки уже актуальны'
          });
        }
      } else {
        await addSyncLog({
          marketplace: 'Wildberries',
          operation: 'stock_update',
          status: 'error',
          message: result.error || 'Ошибка обновления остатков',
          executionTime,
          metadata: result.details || {}
        });

        console.error('❌ Stock update failed:', result.error);
        console.error('📋 Error details:', result.details);
        toast.error('❌ Ошибка обновления остатков Wildberries', {
          description: result.error
        });
        throw new Error(result.error);
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
