
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

    // Специальная диагностика для SKU 2041589280948
    const testSku = "2041589280948";
    const hasTestSku = stocks.some(item => item.offer_id === testSku);
    if (hasTestSku) {
      console.log(`🔍 ДИАГНОСТИКА: Найден тестовый SKU ${testSku} в запросе`);
      const testItem = stocks.find(item => item.offer_id === testSku);
      console.log(`🔍 ДИАГНОСТИКА: Данные для ${testSku}:`, testItem);
    }

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

    // Попробуем получить остатки с текущего склада для диагностики
    console.log(`📦 Проверка текущих остатков на складе ${warehouseId}...`);
    
    try {
      const currentStocksResponse = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('📦 Current stocks response status:', currentStocksResponse.status);
      
      if (currentStocksResponse.ok) {
        const currentStocks = await currentStocksResponse.json();
        console.log('📦 Current stocks response structure:', Object.keys(currentStocks));
        
        if (currentStocks.stocks && Array.isArray(currentStocks.stocks)) {
          const totalStocks = currentStocks.stocks.length;
          console.log(`📦 Найдено товаров с остатками: ${totalStocks}`);
          console.log('📦 Примеры SKU с остатками:', currentStocks.stocks.slice(0, 10).map(s => s.sku));
          
          // Проверяем наш тестовый SKU
          if (hasTestSku) {
            const testSkuStock = currentStocks.stocks.find(s => s.sku === testSku);
            if (testSkuStock) {
              console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} найден в остатках:`, testSkuStock);
            } else {
              console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} НЕ найден в текущих остатках склада`);
            }
          }
          
          // Проверяем сколько из наших SKU есть в остатках
          const ourSkus = stocks.map(item => item.offer_id);
          const existingSkus = currentStocks.stocks.map(s => s.sku);
          const matchingSkus = ourSkus.filter(sku => existingSkus.includes(sku));
          console.log(`📊 Из наших ${ourSkus.length} SKU, ${matchingSkus.length} найдены в остатках склада`);
          
          if (matchingSkus.length > 0) {
            console.log('✅ Найденные SKU:', matchingSkus.slice(0, 5));
          }
        }
      } else {
        const errorText = await currentStocksResponse.text();
        console.log('📦 Current stocks error:', currentStocksResponse.status, errorText);
      }
    } catch (stocksError) {
      console.error('📦 Current stocks request failed:', stocksError);
    }

    // Попробуем получить информацию о товарах через Content API v1
    console.log('📝 Проверка товаров через Content API v1...');
    
    try {
      const contentResponse = await fetch(`${WB_API_URL}/content/v1/cards/cursor/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify({
          sort: {
            cursor: {
              limit: 1000
            }
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      console.log('📝 Content API v1 response status:', contentResponse.status);
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        console.log('📝 Content API v1 response received');
        console.log('📝 Response structure:', Object.keys(contentData));
        
        if (contentData.cards && Array.isArray(contentData.cards)) {
          console.log('📝 Найдено карточек товаров:', contentData.cards.length);
          
          // Собираем все SKU из карточек
          let allSkus = new Set();
          contentData.cards.forEach((card: any) => {
            if (card.sizes && Array.isArray(card.sizes)) {
              card.sizes.forEach((size: any) => {
                if (size.skus && Array.isArray(size.skus)) {
                  size.skus.forEach((sku: string) => {
                    allSkus.add(sku);
                  });
                }
              });
            }
          });
          
          console.log('📝 Общее количество SKU в каталоге:', allSkus.size);
          console.log('📝 Примеры SKU из каталога:', Array.from(allSkus).slice(0, 10));
          
          // Проверяем наш тестовый SKU
          if (hasTestSku) {
            if (allSkus.has(testSku)) {
              console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} найден в каталоге товаров!`);
            } else {
              console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} НЕ найден в каталоге товаров`);
            }
          }
          
          // Проверяем сколько из наших SKU есть в каталоге
          const ourSkus = stocks.map(item => item.offer_id);
          const foundInCatalog = ourSkus.filter(sku => allSkus.has(sku));
          console.log(`📊 Из наших ${ourSkus.length} SKU, ${foundInCatalog.length} найдены в каталоге`);
          
          if (foundInCatalog.length > 0) {
            console.log('✅ SKU найденные в каталоге:', foundInCatalog.slice(0, 5));
          }
        }
      } else {
        const errorText = await contentResponse.text();
        console.log('📝 Content API v1 error:', contentResponse.status, errorText);
      }
    } catch (contentError) {
      console.error('📝 Content API v1 request failed:', contentError);
    }

    // Теперь попробуем обновить остатки с добавленным тестовым SKU
    let finalStocks = [...stocks];
    
    // Если тестового SKU нет в списке, добавляем его
    if (!hasTestSku) {
      console.log(`🔍 ДИАГНОСТИКА: Добавляем тестовый SKU ${testSku} с остатком 3`);
      finalStocks.push({
        offer_id: testSku,
        stock: 3
      });
    } else {
      // Обновляем остаток для тестового SKU
      const testIndex = finalStocks.findIndex(item => item.offer_id === testSku);
      if (testIndex !== -1) {
        finalStocks[testIndex].stock = 3;
        console.log(`🔍 ДИАГНОСТИКА: Обновлен остаток для SKU ${testSku} на 3`);
      }
    }

    const wbPayload = {
      stocks: finalStocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('📤 Отправка обновления остатков в Wildberries...');
    console.log('📤 Количество товаров:', wbPayload.stocks.length);
    
    // Показываем данные для тестового SKU
    const testSkuInPayload = wbPayload.stocks.find(s => s.sku === testSku);
    if (testSkuInPayload) {
      console.log(`🔍 ДИАГНОСТИКА: Данные для отправки SKU ${testSku}:`, testSkuInPayload);
    }

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
      
      // Специальная проверка для тестового SKU
      if (testSkuInPayload) {
        console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} успешно обновлен до ${testSkuInPayload.amount}`);
      }
      
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
        
        // Специальная диагностика для тестового SKU
        if (testSkuInPayload && Array.isArray(conflictData)) {
          const testSkuError = conflictData.find((err: any) => 
            err.data && Array.isArray(err.data) && 
            err.data.some((d: any) => d.sku === testSku)
          );
          
          if (testSkuError) {
            console.log(`🔍 ДИАГНОСТИКА: Ошибка для SKU ${testSku}:`, testSkuError);
          } else {
            console.log(`🔍 ДИАГНОСТИКА: SKU ${testSku} не найден в списке ошибок - возможно обновлен успешно`);
          }
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
