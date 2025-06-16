
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WB_API_URL = 'https://marketplace-api.wildberries.ru';

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
    console.log('Sample stocks data:', stocks.slice(0, 3));

    // Используем ваш ID склада
    const warehouseId = 7963;

    // Формируем данные для обновления остатков
    const wbPayload = {
      stocks: stocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('Sending stocks update to Wildberries:', JSON.stringify(wbPayload, null, 2));

    let response;
    let responseText = '';
    
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
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Получаем текст ответа для анализа
      responseText = await response.text();
      console.log('Response body:', responseText);
      
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

    // Проверяем статус ответа
    if (response.status === 204) {
      // Успешное обновление - Wildberries возвращает 204 No Content при успехе
      console.log('Stocks updated successfully');
      
      const result = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: true,
        errors: []
      }));
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (response.status === 400) {
      // Ошибка валидации - разбираем детали
      let errorDetails = 'Неправильный формат данных';
      let parsedResponse = null;
      
      try {
        parsedResponse = JSON.parse(responseText);
        console.log('Detailed 400 error:', parsedResponse);
        
        if (parsedResponse.errors && Array.isArray(parsedResponse.errors)) {
          errorDetails = parsedResponse.errors.map((err: any) => err.message || err.description || JSON.stringify(err)).join('; ');
        } else if (parsedResponse.message) {
          errorDetails = parsedResponse.message;
        }
      } catch (parseError) {
        console.log('Could not parse error response as JSON');
        errorDetails = responseText || 'Неизвестная ошибка валидации';
      }
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: `Ошибка валидации данных: ${errorDetails}`,
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (response.status === 409) {
      // Конфликт - анализируем ответ API для получения деталей по каждому SKU
      let conflictDetails = 'Конфликт данных';
      let skuSpecificErrors = {};
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Detailed 409 error:', errorData);
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Если есть детальные ошибки по SKU
          errorData.errors.forEach((err: any) => {
            if (err.field && err.field.includes('sku')) {
              const sku = err.value || 'unknown';
              skuSpecificErrors[sku] = err.message || 'SKU не найден в каталоге';
            }
          });
          conflictDetails = errorData.errors.map((err: any) => err.message || err.description || JSON.stringify(err)).join('; ');
        } else if (errorData.message) {
          conflictDetails = errorData.message;
        }
      } catch (parseError) {
        console.log('Could not parse conflict response as JSON');
        conflictDetails = 'SKU не найдены в каталоге Wildberries или неверный ID склада';
      }
      
      // Создаем ответ с учетом специфичных ошибок по SKU
      const result = stocks.map(item => {
        const specificError = skuSpecificErrors[item.offer_id];
        return {
          offer_id: item.offer_id,
          updated: false,
          errors: [
            {
              code: 'SKU_NOT_FOUND',
              message: specificError || `SKU ${item.offer_id} не найден в каталоге Wildberries. Проверьте правильность артикула.`,
            },
          ],
        };
      });
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (response.status === 401 || response.status === 403) {
      console.error('Wildberries Auth Error:', response.status, responseText);
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: `AUTH_ERROR_${response.status}`,
            message: 'Неверный API ключ или недостаточно прав доступа. Проверьте API ключ в личном кабинете.',
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (response.status === 429) {
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'RATE_LIMIT',
            message: 'Превышен лимит запросов к API Wildberries. Попробуйте позже.',
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.error('Unexpected Wildberries API response:', response.status, responseText);
      
      let errorMessage = `Неожиданная ошибка API (${response.status})`;
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage += `: ${errorData.message}`;
          }
        } catch {
          errorMessage += `: ${responseText.substring(0, 200)}`;
        }
      }
      
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: `HTTP_${response.status}`,
            message: errorMessage,
          },
        ],
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
  } catch (error) {
    console.error('Error syncing stocks to Wildberries:', error);
    
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
