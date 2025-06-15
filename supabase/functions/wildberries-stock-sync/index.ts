
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

    // Улучшенное получение списка складов
    let warehousesResponse;
    try {
      // Добавляем больше заголовков для совместимости
      const headers = {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'WB-Integration/2.0',
        'Cache-Control': 'no-cache',
      };

      console.log('Fetching warehouses from Wildberries...');
      
      warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000), // Увеличиваем таймаут до 30 секунд
      });

      console.log('Warehouses response status:', warehousesResponse.status);
      
    } catch (fetchError) {
      console.error('Network error when fetching warehouses:', fetchError);
      
      // Более детальная диагностика ошибки
      if (fetchError.name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа от Wildberries API (30 сек). Попробуйте позже.');
      }
      
      if (fetchError.message.includes('network')) {
        throw new Error('Ошибка сети при подключении к Wildberries. Проверьте интернет-соединение.');
      }
      
      throw new Error(`Ошибка подключения к Wildberries API: ${fetchError.message}`);
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
        errorMessage = 'Превышен лимит запросов к API Wildberries. Повторите через несколько минут.';
      } else if (warehousesResponse.status >= 500) {
        errorMessage = 'Временные проблемы на сервере Wildberries. Повторите попытку через несколько минут.';
      }
      
      throw new Error(`${errorMessage} (Код: ${warehousesResponse.status})`);
    }

    const warehousesData = await warehousesResponse.json();
    console.log('Wildberries warehouses response:', warehousesData);

    if (!warehousesData || warehousesData.length === 0) {
      throw new Error('В аккаунте Wildberries не найдены склады. Убедитесь, что у вас есть активные склады.');
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
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'User-Agent': 'WB-Integration/2.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      };

      stockResponse = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(wbPayload),
        signal: AbortSignal.timeout(45000), // 45 секунд для обновления остатков
      });

      console.log('Stock update response status:', stockResponse.status);
      
    } catch (fetchError) {
      console.error('Network error when updating stocks:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Превышено время ожидания при обновлении остатков (45 сек). Попробуйте с меньшим количеством товаров.');
      }
      
      throw new Error(`Ошибка сети при обновлении остатков: ${fetchError.message}`);
    }

    if (!stockResponse.ok) {
      const errorText = await stockResponse.text();
      console.error('Wildberries Stock Update Error:', stockResponse.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { errorText };
      }

      // Возвращаем детализированные ошибки для каждого товара
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: `HTTP_${stockResponse.status}`,
            message: errorData.errorText || `Ошибка API Wildberries (${stockResponse.status}): ${errorText}`,
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
      details: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
