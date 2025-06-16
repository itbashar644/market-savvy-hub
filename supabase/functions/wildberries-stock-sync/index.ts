
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
      console.log('Fetching warehouses list...');
      warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000) // Увеличиваем таймаут
      });
      
      console.log('Warehouses response status:', warehousesResponse.status);
      
    } catch (fetchError) {
      console.error('Network error while fetching warehouses:', fetchError);
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'NETWORK_ERROR',
            message: 'Не удается подключиться к серверам Wildberries. Проверьте подключение к интернету.',
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (!warehousesResponse.ok) {
      const errorText = await warehousesResponse.text();
      console.error('Wildberries Warehouses API Error:', warehousesResponse.status, errorText);
      
      let errorMessage = 'Ошибка получения списка складов';
      if (warehousesResponse.status === 401 || warehousesResponse.status === 403) {
        errorMessage = 'Неверный API ключ или недостаточно прав доступа';
      } else if (warehousesResponse.status === 429) {
        errorMessage = 'Слишком много запросов. Попробуйте позже';
      }
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'API_ERROR',
            message: errorMessage,
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const warehousesData = await warehousesResponse.json();
    console.log('Wildberries warehouses:', warehousesData);

    if (!warehousesData || warehousesData.length === 0) {
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'NO_WAREHOUSES',
            message: 'В аккаунте Wildberries не найдено активных складов',
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const warehouseId = warehousesData[0].id;

    // Обновляем остатки
    const wbPayload = {
      stocks: stocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('Sending stocks update to Wildberries:', wbPayload);

    let response;
    try {
      response = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify(wbPayload),
        signal: AbortSignal.timeout(30000)
      });
      
      console.log('Stock update response status:', response.status);
      
    } catch (fetchError) {
      console.error('Network error while updating stocks:', fetchError);
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'NETWORK_ERROR',
            message: 'Не удается отправить данные на серверы Wildberries. Проверьте подключение к интернету.',
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const responseData = await response.json();
    console.log('Wildberries stock update response:', responseData);

    if (!response.ok) {
      console.error('Wildberries Stock Update Error:', responseData);
      
      let errorMessage = 'Ошибка обновления остатков';
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Неверный API ключ или недостаточно прав доступа';
      } else if (response.status === 429) {
        errorMessage = 'Слишком много запросов. Попробуйте позже';
      } else if (responseData.errorText) {
        errorMessage = responseData.errorText;
      }
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: responseData.errorText || 'API_ERROR',
            message: errorMessage,
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Формируем результат в формате, совместимом с Ozon
    const result = stocks.map(item => ({
      offer_id: item.offer_id,
      updated: true,
      errors: []
    }));
    
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error syncing stocks to Wildberries:', error);
    
    // Формируем ответ с ошибками для всех товаров
    const { stocks } = await req.json().catch(() => ({ stocks: [] }));
    const allErrors = (stocks || []).map((item: any) => ({
      offer_id: item?.offer_id || 'unknown',
      updated: false,
      errors: [
        {
          code: 'SYNC_ERROR',
          message: error.message || 'Неизвестная ошибка синхронизации',
        },
      ],
    }));
    
    return new Response(JSON.stringify({ result: allErrors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
