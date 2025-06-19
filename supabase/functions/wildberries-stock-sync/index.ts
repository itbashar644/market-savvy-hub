
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
    console.log('📊 Получено товаров для обновления:', stocks.length);
    console.log('🔑 API Key (первые 10 символов):', apiKey.substring(0, 10) + '...');

    // Получаем список складов для определения правильного ID
    console.log('🏢 ==> ЭТАП 1: Получение списка складов');
    
    let warehouseId = 7963; // ID по умолчанию
    let validWarehouseId = null;
    
    try {
      console.log('🏢 Отправляем запрос на получение складов...');
      const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(15000)
      });

      console.log('🏢 Статус ответа складов:', warehousesResponse.status);

      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json();
        console.log('🏢 ✅ Полученные склады:', JSON.stringify(warehousesData, null, 2));
        
        if (Array.isArray(warehousesData) && warehousesData.length > 0) {
          validWarehouseId = warehousesData[0].id;
          console.log(`🏢 ✅ Выбран склад ID: ${validWarehouseId} (название: ${warehousesData[0].name || 'N/A'})`);
        }
      } else {
        const errorText = await warehousesResponse.text();
        console.log('🏢 ❌ Ошибка получения складов. Код:', warehousesResponse.status, 'Текст:', errorText);
      }
    } catch (warehouseError) {
      console.error('🏢 💥 Исключение при получении складов:', warehouseError);
    }

    const finalWarehouseId = validWarehouseId || warehouseId;
    console.log(`🏢 🎯 Итоговый ID склада: ${finalWarehouseId}`);

    // Валидируем и подготавливаем данные - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ ДЕТАЛЬНОГО ЛОГИРОВАНИЯ
    console.log('📋 ==> ЭТАП 2: Валидация и подготовка данных');
    
    const validStocks = [];
    let invalidCount = 0;
    
    for (const item of stocks) {
      const skuNumber = parseInt(item.offer_id);
      if (isNaN(skuNumber)) {
        invalidCount++;
      } else {
        validStocks.push({
          ...item,
          offer_id: skuNumber.toString()
        });
      }
    }

    console.log(`📋 📊 Результат валидации: валидных ${validStocks.length}, невалидных ${invalidCount} из ${stocks.length}`);

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
      stocks: validStocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock || 0,
        warehouseId: finalWarehouseId
      }))
    };

    console.log('📤 🎯 PAYLOAD для WB API (первые 3 товара):');
    console.log(JSON.stringify({
      stocks: wbPayload.stocks.slice(0, 3)
    }, null, 2));
    console.log(`📤 Всего товаров в payload: ${wbPayload.stocks.length}`);

    // Отправляем запрос в WB API
    console.log('🌐 ==> ЭТАП 4: Отправка запроса в WB API');
    console.log(`🌐 URL: ${WB_API_URL}/api/v3/stocks/${finalWarehouseId}`);

    let response;
    let responseText = '';
    
    try {
      const startTime = Date.now();
      
      console.log('🌐 🚀 ОТПРАВЛЯЕМ ЗАПРОС В WB API...');
      
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
      console.log('🌐 📡 Статус ответа WB API:', response.status, response.statusText);
      
      responseText = await response.text();
      console.log('🌐 📄 Тело ответа WB API (длина):', responseText.length);
      console.log('🌐 📄 Тело ответа WB API:', responseText);
      
    } catch (fetchError) {
      console.error('🌐 💥 КРИТИЧЕСКАЯ ОШИБКА ЗАПРОСА К WB API:', fetchError);
      
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

    // Анализ ответа WB API
    console.log('🔍 ==> ЭТАП 5: АНАЛИЗ ОТВЕТА WB API');
    console.log(`🔍 HTTP Status: ${response.status}`);
    
    // Обработка успешного ответа (HTTP 204)
    if (response.status === 204) {
      console.log('🔍 ✅ HTTP 204: Остатки успешно обновлены (No Content)');
      
      const result = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: true,
        errors: []
      }));
      
      console.log('🔍 🎉 ИТОГОВЫЙ РЕЗУЛЬТАТ: ВСЕ ТОВАРЫ УСПЕШНО ОБНОВЛЕНЫ');
      console.log('🔍 📊 Количество обновленных товаров:', result.length);
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    
    // Обработка ошибок валидации (HTTP 400)
    else if (response.status === 400) {
      console.log('🔍 ❌ HTTP 400: Ошибка валидации данных');
      let errorDetails = 'Неправильный формат данных';
      
      try {
        if (responseText) {
          const parsedResponse = JSON.parse(responseText);
          console.log('🔍 ❌ Детали ошибки 400:', JSON.stringify(parsedResponse, null, 2));
          
          if (parsedResponse.errors && Array.isArray(parsedResponse.errors)) {
            errorDetails = parsedResponse.errors.map((err: any) => 
              err.message || err.description || JSON.stringify(err)
            ).join('; ');
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
    
    // Обработка конфликтов - SKU не найдены (HTTP 409)
    else if (response.status === 409) {
      console.log('🔍 ❌ HTTP 409: Конфликт - товары не найдены в каталоге');
      
      const result = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'SKU_NOT_FOUND',
          message: `SKU ${item.offer_id} не найден в каталоге Wildberries или недоступен для обновления остатков. Проверьте: 1) Товар добавлен в каталог, 2) Товар прошел модерацию, 3) SKU корректен`
        }]
      }));
      
      console.log('🔍 💡 РЕКОМЕНДАЦИИ: Проверьте в личном кабинете WB корректность и доступность SKU');
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Обработка ошибок авторизации (HTTP 401, 403)
    else if (response.status === 401 || response.status === 403) {
      console.error(`🔍 🔐 HTTP ${response.status}: Ошибка авторизации/прав доступа`);
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: `AUTH_ERROR_${response.status}`,
          message: `Ошибка авторизации (${response.status}): Неверный API ключ или недостаточно прав для обновления остатков`
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Обработка других ошибок
    else {
      console.error(`🔍 🚫 HTTP ${response.status}: Неожиданный статус ответа от WB API`);
      console.error('🔍 🚫 Response Body:', responseText);
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: `HTTP_${response.status}`,
          message: `Неожиданная ошибка API (${response.status}): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`
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
