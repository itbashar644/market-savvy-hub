
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

    // Логируем КАЖДЫЙ полученный SKU
    console.log('📋 Все полученные SKU для обновления:');
    stocks.forEach((item, index) => {
      console.log(`  ${index + 1}. SKU: ${item.offer_id}, остаток: ${item.stock}`);
    });

    // Используем ваш ID склада
    const warehouseId = 7963;

    // Попробуем получить список складов для диагностики
    console.log('🏢 Получение списка складов для диагностики...');
    
    try {
      const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('🏢 Warehouses response status:', warehousesResponse.status);
      
      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json();
        console.log('🏢 Доступные склады:', warehousesData);
        
        if (Array.isArray(warehousesData) && warehousesData.length > 0) {
          const currentWarehouse = warehousesData.find(w => w.id === warehouseId);
          if (currentWarehouse) {
            console.log(`✅ Склад ${warehouseId} найден:`, currentWarehouse);
          } else {
            console.log(`❌ Склад ${warehouseId} НЕ найден в списке доступных складов!`);
            console.log('📋 Доступные склады:', warehousesData.map(w => ({ id: w.id, name: w.name })));
          }
        }
      } else {
        const errorText = await warehousesResponse.text();
        console.log('🏢 Warehouses API error:', warehousesResponse.status, errorText);
      }
    } catch (warehouseError) {
      console.error('🏢 Warehouses API request failed:', warehouseError);
    }

    // НЕ ДОБАВЛЯЕМ тестовый SKU - используем только переданные данные
    const finalStocks = [...stocks];

    const wbPayload = {
      stocks: finalStocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('📤 Отправка обновления остатков в Wildberries...');
    console.log('📤 Количество товаров:', wbPayload.stocks.length);
    
    // Логируем все SKU, которые отправляем
    console.log('📤 Все SKU для отправки:');
    wbPayload.stocks.forEach((item, index) => {
      console.log(`  ${index + 1}. SKU: ${item.sku}, остаток: ${item.amount}, склад: ${item.warehouseId}`);
    });

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
      
      console.log('📤 Stock update response status:', response.status);
      console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));
      
      responseText = await response.text();
      console.log('📤 Response body:', responseText);
      
    } catch (fetchError) {
      console.error('🚫 Network error while updating stocks:', fetchError);
      
      const allErrors = finalStocks.map(item => ({
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
      console.log('✅ Остатки обновлены успешно');
      
      // Логируем успех для всех SKU
      finalStocks.forEach(item => {
        console.log(`✅ SKU ${item.offer_id}: успешно обновлен до ${item.stock}`);
      });
      
      const result = finalStocks.map(item => ({
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
        console.log('❌ Detailed 400 error:', parsedResponse);
        
        if (parsedResponse.errors && Array.isArray(parsedResponse.errors)) {
          errorDetails = parsedResponse.errors.map((err: any) => err.message || err.description || JSON.stringify(err)).join('; ');
        } else if (parsedResponse.message) {
          errorDetails = parsedResponse.message;
        }
      } catch (parseError) {
        console.log('⚠️ Could not parse error response as JSON');
        errorDetails = responseText || 'Неизвестная ошибка валидации';
      }
      
      const allErrors = finalStocks.map(item => ({
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
      console.log('🔍 Анализ 409 ошибки в деталях...');
      let conflictData = null;
      
      try {
        conflictData = JSON.parse(responseText);
        console.log('❌ Detailed 409 error:', conflictData);
        
        // Логируем ошибки для всех SKU
        if (Array.isArray(conflictData)) {
          finalStocks.forEach(item => {
            const errorForSku = conflictData.find((err: any) => 
              err.data && Array.isArray(err.data) && 
              err.data.some((d: any) => d.sku === item.offer_id)
            );
            
            if (errorForSku) {
              console.log(`❌ SKU ${item.offer_id}: ${errorForSku.message || 'NotFound'} - товар не найден в каталоге`);
            } else {
              console.log(`🔍 SKU ${item.offer_id}: не найден в списке ошибок - возможно обновлен успешно`);
            }
          });
        }
        
        // Если ответ - массив ошибок
        if (Array.isArray(conflictData)) {
          const result = finalStocks.map(item => {
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
              // Если нет ошибки для SKU, возможно он обновился успешно
              return {
                offer_id: item.offer_id,
                updated: true,
                errors: []
              };
            }
          });
          
          return new Response(JSON.stringify({ result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
      } catch (parseError) {
        console.log('⚠️ Could not parse conflict response as JSON');
      }
      
      // Fallback для 409 ошибок
      const result = finalStocks.map(item => ({
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
      console.error('🔐 Wildberries Auth Error:', response.status, responseText);
      
      const allErrors = finalStocks.map(item => ({
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
      const allErrors = finalStocks.map(item => ({
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
      console.error('🚫 Unexpected Wildberries API response:', response.status, responseText);
      
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
      
      const allErrors = finalStocks.map(item => ({
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
    console.error('💥 Error syncing stocks to Wildberries:', error);
    
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
