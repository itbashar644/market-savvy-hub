
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
      console.log('🔍 Получен пустой массив товаров для обновления');
      return new Response(JSON.stringify({ result: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('🚀 ==> НАЧАЛО ОБНОВЛЕНИЯ ОСТАТКОВ WB <==');
    console.log('📊 Получен запрос на обновление остатков:', stocks.length, 'товаров');
    console.log('📦 Полные данные запроса:', JSON.stringify(stocks, null, 2));
    console.log('🔑 API Key (первые 10 символов):', apiKey.substring(0, 10) + '...');

    // Получаем список складов для определения правильного ID
    console.log('🏢 ==> ЭТАП 1: Получение списка складов');
    
    let warehouseId = 7963; // ID по умолчанию
    let validWarehouseId = null;
    let warehousesData = null;
    
    try {
      console.log('🏢 Отправляем запрос на получение складов...');
      const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('🏢 Статус ответа складов:', warehousesResponse.status);
      console.log('🏢 Headers ответа складов:', Object.fromEntries(warehousesResponse.headers.entries()));

      if (warehousesResponse.ok) {
        warehousesData = await warehousesResponse.json();
        console.log('🏢 ✅ Полученные склады:', JSON.stringify(warehousesData, null, 2));
        
        if (Array.isArray(warehousesData) && warehousesData.length > 0) {
          validWarehouseId = warehousesData[0].id;
          console.log(`🏢 ✅ Выбран склад ID: ${validWarehouseId} (название: ${warehousesData[0].name || 'N/A'})`);
        } else {
          console.log('🏢 ⚠️ Массив складов пуст или неверный формат');
        }
      } else {
        const errorText = await warehousesResponse.text();
        console.log('🏢 ❌ Ошибка получения складов. Код:', warehousesResponse.status);
        console.log('🏢 ❌ Текст ошибки:', errorText);
      }
    } catch (warehouseError) {
      console.error('🏢 💥 Исключение при получении складов:', warehouseError);
    }

    const finalWarehouseId = validWarehouseId || warehouseId;
    console.log(`🏢 🎯 Итоговый ID склада: ${finalWarehouseId}`);

    // Валидируем и подготавливаем данные
    console.log('📋 ==> ЭТАП 2: Валидация и подготовка данных');
    
    const validStocks = [];
    const invalidStocks = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const item = stocks[i];
      console.log(`📋 Обрабатываем товар ${i + 1}/${stocks.length}:`, JSON.stringify(item, null, 2));
      
      const skuNumber = parseInt(item.offer_id);
      if (isNaN(skuNumber)) {
        console.warn(`📋 ❌ Товар ${i + 1}: Неверный формат SKU: "${item.offer_id}" (тип: ${typeof item.offer_id})`);
        invalidStocks.push({
          ...item,
          error: `Неверный формат SKU: ${item.offer_id}`
        });
      } else {
        const validItem = {
          ...item,
          offer_id: skuNumber.toString()
        };
        console.log(`📋 ✅ Товар ${i + 1}: SKU валиден: ${validItem.offer_id}, остаток: ${validItem.stock}`);
        validStocks.push(validItem);
      }
    }

    console.log(`📋 📊 Результат валидации: валидных ${validStocks.length}, невалидных ${invalidStocks.length} из ${stocks.length}`);

    if (validStocks.length === 0) {
      console.log('📋 ❌ НЕТ ВАЛИДНЫХ ТОВАРОВ для обновления');
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'INVALID_SKU_FORMAT',
          message: `SKU ${item.offer_id} имеет неверный формат. Ожидается числовое значение.`
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Подготавливаем payload для WB API
    console.log('📤 ==> ЭТАП 3: Подготовка данных для WB API');
    
    const wbPayload = {
      stocks: validStocks.map((item, index) => {
        const stockItem = {
          sku: item.offer_id,
          amount: item.stock || 0,
          warehouseId: finalWarehouseId
        };
        console.log(`📤 Товар ${index + 1}: SKU=${stockItem.sku}, остаток=${stockItem.amount}, складID=${stockItem.warehouseId}`);
        return stockItem;
      })
    };

    console.log('📤 🎯 ИТОГОВЫЙ PAYLOAD для WB API:');
    console.log(JSON.stringify(wbPayload, null, 2));

    // Отправляем запрос в WB API
    console.log('🌐 ==> ЭТАП 4: Отправка запроса в WB API');
    console.log(`🌐 URL: ${WB_API_URL}/api/v3/stocks/${finalWarehouseId}`);
    console.log(`🌐 Method: PUT`);
    console.log(`🌐 Headers: Content-Type: application/json, Authorization: ${apiKey.substring(0, 10)}...`);

    let response;
    let responseText = '';
    
    try {
      const startTime = Date.now();
      
      response = await fetch(`${WB_API_URL}/api/v3/stocks/${finalWarehouseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify(wbPayload),
        signal: AbortSignal.timeout(30000)
      });
      
      const requestTime = Date.now() - startTime;
      console.log(`🌐 ⏱️ Время запроса: ${requestTime}ms`);
      console.log('🌐 📡 Статус ответа:', response.status);
      console.log('🌐 📡 Status Text:', response.statusText);
      console.log('🌐 📡 Headers ответа:', Object.fromEntries(response.headers.entries()));
      
      responseText = await response.text();
      console.log('🌐 📄 Полное тело ответа:');
      console.log(responseText);
      
    } catch (fetchError) {
      console.error('🌐 💥 КРИТИЧЕСКАЯ ОШИБКА СЕТИ:', fetchError);
      console.error('🌐 💥 Тип ошибки:', fetchError.name);
      console.error('🌐 💥 Сообщение:', fetchError.message);
      console.error('🌐 💥 Stack:', fetchError.stack);
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'NETWORK_ERROR',
          message: `Ошибка сети: ${fetchError.message}`
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Подробный анализ ответа
    console.log('🔍 ==> ЭТАП 5: Анализ ответа WB API');
    console.log(`🔍 HTTP Status: ${response.status} (${response.statusText})`);
    
    // Обработка ответов
    if (response.status === 204) {
      console.log('🔍 ✅ HTTP 204: Остатки успешно обновлены (No Content)');
      console.log('🔍 ✅ Это означает, что WB API принял и обработал запрос');
      
      const result = validStocks.map((item, index) => {
        console.log(`🔍 ✅ Товар ${index + 1}: SKU ${item.offer_id} - ОБНОВЛЕН`);
        return {
          offer_id: item.offer_id,
          updated: true,
          errors: []
        };
      });
      
      console.log('🔍 🎉 РЕЗУЛЬТАТ: ВСЕ ТОВАРЫ УСПЕШНО ОБНОВЛЕНЫ');
      console.log('🔍 📊 Обновлено товаров:', result.length);
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    
    else if (response.status === 400) {
      console.log('🔍 ❌ HTTP 400: Ошибка валидации запроса');
      let errorDetails = 'Неправильный формат данных';
      let parsedResponse = null;
      
      try {
        if (responseText) {
          parsedResponse = JSON.parse(responseText);
          console.log('🔍 ❌ Детали ошибки 400:', JSON.stringify(parsedResponse, null, 2));
          
          if (parsedResponse.errors && Array.isArray(parsedResponse.errors)) {
            errorDetails = parsedResponse.errors.map((err: any) => {
              console.log('🔍 ❌ Ошибка:', err);
              return err.message || err.description || JSON.stringify(err);
            }).join('; ');
          } else if (parsedResponse.message) {
            errorDetails = parsedResponse.message;
          }
        }
      } catch (parseError) {
        console.log('🔍 ❌ Не удалось распарсить JSON ошибки:', parseError);
        errorDetails = responseText || 'Неизвестная ошибка валидации';
      }
      
      console.log('🔍 ❌ Итоговое сообщение об ошибке:', errorDetails);
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: `Ошибка валидации: ${errorDetails}`
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    else if (response.status === 409) {
      console.log('🔍 ❌ HTTP 409: Конфликт - товары не найдены в каталоге');
      console.log('🔍 ❌ Это означает, что SKU не существуют в каталоге WB');
      
      let conflictDetails = '';
      try {
        if (responseText) {
          const parsedResponse = JSON.parse(responseText);
          console.log('🔍 ❌ Детали конфликта:', JSON.stringify(parsedResponse, null, 2));
          conflictDetails = JSON.stringify(parsedResponse);
        }
      } catch (e) {
        conflictDetails = responseText;
      }
      
      const result = validStocks.map((item, index) => {
        console.log(`🔍 ❌ Товар ${index + 1}: SKU ${item.offer_id} - НЕ НАЙДЕН в каталоге WB`);
        return {
          offer_id: item.offer_id,
          updated: false,
          errors: [{
            code: 'SKU_NOT_FOUND',
            message: `SKU ${item.offer_id} не найден в каталоге Wildberries. Убедитесь, что товар добавлен в личный кабинет и прошел модерацию.`
          }]
        };
      });
      
      console.log('🔍 💡 РЕШЕНИЕ: Проверьте в личном кабинете WB наличие товаров с указанными SKU');
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    else if (response.status === 401 || response.status === 403) {
      console.error(`🔍 🔐 HTTP ${response.status}: Ошибка авторизации`);
      console.error('🔍 🔐 Проверьте правильность API ключа и его права доступа');
      console.error('🔍 🔐 API Key (первые 10 символов):', apiKey.substring(0, 10) + '...');
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: `AUTH_ERROR_${response.status}`,
          message: 'Неверный API ключ или недостаточно прав доступа.'
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    else {
      // Неожиданная ошибка
      console.error(`🔍 🚫 HTTP ${response.status}: Неожиданный статус ответа`);
      console.error('🔍 🚫 Status Text:', response.statusText);
      console.error('🔍 🚫 Response Body:', responseText);
      console.error('🔍 🚫 Response Headers:', Object.fromEntries(response.headers.entries()));
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: `HTTP_${response.status}`,
          message: `Неожиданная ошибка API (${response.status}): ${responseText.substring(0, 200)}`
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
  } catch (error) {
    console.error('💥 ==> КРИТИЧЕСКАЯ ОШИБКА В ФУНКЦИИ <==');
    console.error('💥 Тип ошибки:', typeof error);
    console.error('💥 Название:', error.name);
    console.error('💥 Сообщение:', error.message);
    console.error('💥 Stack trace:', error.stack);
    console.error('💥 Полный объект ошибки:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Неизвестная ошибка сервера',
      errorType: error.name || 'UnknownError',
      errorStack: error.stack || 'No stack trace available'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
