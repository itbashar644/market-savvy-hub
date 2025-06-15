
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WB_API_URL = 'https://suppliers-api.wildberries.ru';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { stocks, apiKey } = await req.json();

    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('"stocks" array is required in the request body.');
    }
    
    if (!apiKey) {
      throw new Error('Wildberries API key is required in the request body.');
    }

    if (stocks.length === 0) {
      return new Response(JSON.stringify({ result: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Syncing stocks to Wildberries for', stocks.length, 'items');

    // Получаем список складов с улучшенной обработкой ошибок
    let warehousesResponse;
    try {
      warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; WB-Integration/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10 секунд таймаут
      });
    } catch (fetchError) {
      console.error('Network error when fetching warehouses:', fetchError);
      throw new Error(`Ошибка сети при получении складов: ${fetchError.message}`);
    }

    if (!warehousesResponse.ok) {
      const errorText = await warehousesResponse.text();
      console.error('Wildberries Warehouses API Error:', warehousesResponse.status, errorText);
      
      let errorMessage = 'Ошибка получения складов от Wildberries';
      if (warehousesResponse.status === 401) {
        errorMessage = 'Неверный API ключ Wildberries';
      } else if (warehousesResponse.status === 403) {
        errorMessage = 'Недостаточно прав доступа к API Wildberries';
      } else if (warehousesResponse.status === 429) {
        errorMessage = 'Превышен лимит запросов к API Wildberries';
      }
      
      throw new Error(`${errorMessage}: ${warehousesResponse.status} ${errorText}`);
    }

    const warehousesData = await warehousesResponse.json();
    console.log('Wildberries warehouses response:', warehousesData);

    if (!warehousesData || warehousesData.length === 0) {
      throw new Error('В аккаунте Wildberries не найдены склады');
    }

    const warehouseId = warehousesData[0].id;
    console.log('Using warehouse ID:', warehouseId);

    // Обновляем остатки с улучшенной обработкой ошибок
    const wbPayload = {
      stocks: stocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('Sending stocks update to Wildberries:', JSON.stringify(wbPayload, null, 2));

    let stockResponse;
    try {
      stockResponse = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'Mozilla/5.0 (compatible; WB-Integration/1.0)',
        },
        body: JSON.stringify(wbPayload),
        signal: AbortSignal.timeout(15000), // 15 секунд таймаут
      });
    } catch (fetchError) {
      console.error('Network error when updating stocks:', fetchError);
      throw new Error(`Ошибка сети при обновлении остатков: ${fetchError.message}`);
    }

    console.log('Stock update response status:', stockResponse.status);

    if (!stockResponse.ok) {
      const errorText = await stockResponse.text();
      console.error('Wildberries Stock Update Error:', stockResponse.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { errorText };
      }

      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: errorData.errorText || 'API_ERROR',
            message: errorData.errorText || `Ошибка API Wildberries: ${stockResponse.status}`,
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const responseData = await stockResponse.text();
    console.log('Wildberries stock update response:', responseData);

    // Формируем результат в формате, совместимом с Ozon
    const result = stocks.map(item => ({
      offer_id: item.offer_id,
      updated: true,
      errors: []
    }));
    
    console.log('Final result:', JSON.stringify(result, null, 2));
    
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error syncing stocks to Wildberries:', error);
    
    // Возвращаем детальную информацию об ошибке
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack || 'No stack trace available'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
