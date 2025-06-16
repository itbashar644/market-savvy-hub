
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

    // Сначала попробуем получить информацию о товарах через Content API
    console.log('Checking products in Content API...');
    
    let availableSkus = new Set();
    
    try {
      const contentResponse = await fetch(`${WB_API_URL}/content/v2/get/cards/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify({
          settings: {
            sort: {
              ascending: false
            },
            filter: {
              withPhoto: -1
            }
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      console.log('Content API response status:', contentResponse.status);
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        console.log('Content API response received, cards count:', contentData.cards?.length || 0);
        
        if (contentData.cards && Array.isArray(contentData.cards)) {
          contentData.cards.forEach((card: any) => {
            if (card.sizes && Array.isArray(card.sizes)) {
              card.sizes.forEach((size: any) => {
                if (size.skus && Array.isArray(size.skus)) {
                  size.skus.forEach((sku: string) => {
                    availableSkus.add(sku);
                  });
                }
              });
            }
          });
        }
        
        console.log('Found SKUs in content:', Array.from(availableSkus).slice(0, 10));
        console.log('Total SKUs found:', availableSkus.size);
      } else {
        const errorText = await contentResponse.text();
        console.log('Content API error:', contentResponse.status, errorText);
      }
    } catch (contentError) {
      console.error('Content API request failed:', contentError);
    }

    // Проверим, какие из наших SKU найдены в системе
    const foundSkus = stocks.filter(item => availableSkus.has(item.offer_id));
    const notFoundSkus = stocks.filter(item => !availableSkus.has(item.offer_id));
    
    console.log('SKUs found in content:', foundSkus.length);
    console.log('SKUs not found in content:', notFoundSkus.length);
    console.log('Sample not found SKUs:', notFoundSkus.slice(0, 5).map(s => s.offer_id));

    // Попробуем альтернативный подход - получить остатки через API
    console.log('Trying to get current stocks from API...');
    
    try {
      const stocksResponse = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('Stocks GET response status:', stocksResponse.status);
      
      if (stocksResponse.ok) {
        const currentStocks = await stocksResponse.json();
        console.log('Current stocks response:', currentStocks);
        
        if (currentStocks.stocks && Array.isArray(currentStocks.stocks)) {
          const existingSkus = new Set(currentStocks.stocks.map((s: any) => s.sku));
          console.log('SKUs with existing stocks:', Array.from(existingSkus).slice(0, 10));
          console.log('Total SKUs with stocks:', existingSkus.size);
          
          // Проверим пересечения
          const matchingSkus = stocks.filter(item => existingSkus.has(item.offer_id));
          console.log('Our SKUs that have existing stocks:', matchingSkus.length);
        }
      } else {
        const errorText = await stocksResponse.text();
        console.log('Stocks GET error:', stocksResponse.status, errorText);
      }
    } catch (stocksError) {
      console.error('Stocks GET request failed:', stocksError);
    }

    // Теперь попробуем обновить остатки
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
      console.log('Analyzing 409 conflict in detail...');
      let conflictDetails = 'Конфликт данных';
      let conflictData = null;
      
      try {
        conflictData = JSON.parse(responseText);
        console.log('Detailed 409 error:', conflictData);
        
        // Попробуем найти более детальную информацию об ошибке
        if (Array.isArray(conflictData)) {
          // Если ответ - массив ошибок
          const result = stocks.map(item => {
            // Ищем ошибку для этого SKU
            const errorForSku = conflictData.find((err: any) => 
              err.data && Array.isArray(err.data) && 
              err.data.some((d: any) => d.sku === item.offer_id)
            );
            
            if (errorForSku) {
              return {
                offer_id: item.offer_id,
                updated: false,
                errors: [
                  {
                    code: errorForSku.code || 'CONFLICT_ERROR',
                    message: `${errorForSku.message || 'Товар не найден в каталоге'}. SKU ${item.offer_id} не существует в вашем личном кабинете Wildberries или имеет ограничения на обновление остатков.`,
                  },
                ],
              };
            } else {
              return {
                offer_id: item.offer_id,
                updated: false,
                errors: [
                  {
                    code: 'SKU_NOT_FOUND',
                    message: `SKU ${item.offer_id} не найден в каталоге Wildberries. Убедитесь, что товар добавлен в ваш личный кабинет и имеет статус, позволяющий обновление остатков.`,
                  },
                ],
              };
            }
          });
          
          return new Response(JSON.stringify({ result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
      } catch (parseError) {
        console.log('Could not parse conflict response as JSON');
      }
      
      // Fallback для 409 ошибок
      const result = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: 'SKU_NOT_FOUND',
            message: `SKU ${item.offer_id} не найден в каталоге Wildberries или не может быть обновлен. Возможные причины: 1) Товар не добавлен в личный кабинет; 2) Товар находится в статусе модерации; 3) У товара заблокированы остатки; 4) Неправильный ID склада (${warehouseId}).`,
          },
        ],
      }));
      
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
            message: 'Неверный API ключ или недостаточно прав доступа. Убедитесь, что API ключ активен и имеет права на обновление остатков.',
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
