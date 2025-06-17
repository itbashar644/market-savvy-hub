
import { ValidatedProduct } from './useWildberriesStockValidator';

export interface WildberriesApiResponse {
  result: Array<{
    offer_id: string;
    updated: boolean;
    errors?: Array<{
      code: string;
      message: string;
    }>;
  }>;
}

export interface SkuUpdateResult {
  wbSku: string;
  originalSku: string;
  productName: string;
  stock: number;
  status: 'updated' | 'error' | 'NotFound';
  error: string | null;
}

export const useWildberriesApiClient = () => {
  const updateStocksApi = async (
    validProducts: ValidatedProduct[], 
    apiKey: string
  ): Promise<SkuUpdateResult[]> => {
    console.log(`📤 Отправляем ${validProducts.length} SKU в Wildberries API:`);
    
    validProducts.forEach((item, index) => {
      console.log(`  ${index + 1}. SKU ${item.wbSku} (${item.originalSku}) - остаток: ${item.stock} - ${item.productName}`);
    });

    const requestData = { 
      stocks: validProducts.map(p => ({
        offer_id: p.wbSku,
        stock: p.stock
      })),
      apiKey: apiKey
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
        return validProducts.map(product => ({
          wbSku: product.wbSku,
          originalSku: product.originalSku,
          productName: product.productName,
          stock: product.stock,
          status: 'NotFound' as const,
          error: 'Товар не найден в каталоге Wildberries'
        }));
      }
      
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result: WildberriesApiResponse = await response.json();
    console.log('📨 Response result:', result);

    // Создаем детальные результаты для каждого SKU
    return result.result.map((item) => {
      const productDetail = validProducts.find(p => p.wbSku === item.offer_id);
      
      if (item.updated) {
        console.log(`✅ SKU ${item.offer_id} (исходный: ${productDetail?.originalSku}): успешно обновлен, остаток ${productDetail?.stock} - ${productDetail?.productName}`);
        return {
          wbSku: item.offer_id,
          originalSku: productDetail?.originalSku || 'N/A',
          productName: productDetail?.productName || 'N/A',
          stock: productDetail?.stock || 0,
          status: 'updated' as const,
          error: null
        };
      } else {
        const errors = item.errors?.map(e => e.code || e.message).join(', ') || 'Unknown error';
        console.log(`❌ SKU ${item.offer_id} (исходный: ${productDetail?.originalSku}): ошибка - ${errors} - ${productDetail?.productName}`);
        return {
          wbSku: item.offer_id,
          originalSku: productDetail?.originalSku || 'N/A',
          productName: productDetail?.productName || 'N/A',
          stock: productDetail?.stock || 0,
          status: 'error' as const,
          error: errors
        };
      }
    });
  };

  return { updateStocksApi };
};
