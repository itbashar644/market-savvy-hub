
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

    console.log('Получен запрос на обновление остатков:', stocks.length, 'товаров');
    console.log('Пример данных:', stocks.slice(0, 3));

    // Получаем список складов для определения правильного ID
    console.log('🏢 Получение списка складов...');
    
    let warehouseId = 7963; // ID по умолчанию
    let validWarehouseId = null;
    
    try {
      const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json();
        console.log('🏢 Доступные склады:', warehousesData);
        
        if (Array.isArray(warehousesData) && warehousesData.length > 0) {
          // Берем первый доступный склад
          validWarehouseId = warehousesData[0].id;
          console.log(`✅ Используем склад ID: ${validWarehouseId}`);
        }
      } else {
        console.log('🏢 Не удалось получить список складов, используем ID по умолчанию');
      }
    } catch (warehouseError) {
      console.error('🏢 Ошибка получения складов:', warehouseError);
    }

    // Используем найденный склад или дефолтный
    const finalWarehouseId = validWarehouseId || warehouseId;

    // Валидируем и подготавливаем данные
    const validStocks = stocks.filter(item => {
      const skuNumber = parseInt(item.offer_id);
      if (isNaN(skuNumber)) {
        console.warn(`❌ Неверный формат SKU: ${item.offer_id}`);
        return false;
      }
      return true;
    }).map(item => ({
      ...item,
      offer_id: parseInt(item.offer_id).toString() // Убеждаемся что это строка числа
    }));

    console.log(`📤 Валидных товаров для обновления: ${validStocks.length} из ${stocks.length}`);

    if (validStocks.length === 0) {
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

    const wbPayload = {
      stocks: validStocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock || 0,
        warehouseId: finalWarehouseId
      }))
    };

    console.log('📤 Отправка запроса в Wildberries API...');
    console.log('📤 Payload:', JSON.stringify(wbPayload, null, 2));

    let response;
    let responseText = '';
    
    try {
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
      
      console.log('📤 Статус ответа:', response.status);
      responseText = await response.text();
      console.log('📤 Тело ответа:', responseText);
      
    } catch (fetchError) {
      console.error('🚫 Ошибка сети:', fetchError);
      
      const allErrors = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'NETWORK_ERROR',
          message: 'Не удается подключиться к серверам Wildberries.'
        }]
      }));
      
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Обработка ответов
    if (response.status === 204) {
      console.log('✅ Остатки успешно обновлены');
      
      const result = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: true,
        errors: []
      }));
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    
    if (response.status === 400) {
      console.log('❌ Ошибка валидации (400)');
      let errorDetails = 'Неправильный формат данных';
      
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log('❌ Детали ошибки:', parsedResponse);
        
        if (parsedResponse.errors && Array.isArray(parsedResponse.errors)) {
          errorDetails = parsedResponse.errors.map((err: any) => 
            err.message || err.description || JSON.stringify(err)
          ).join('; ');
        }
      } catch {
        errorDetails = responseText || 'Неизвестная ошибка валидации';
      }
      
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
    
    if (response.status === 409) {
      console.log('🔍 Ошибка 409 - товары не найдены в каталоге');
      
      const result = validStocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [{
          code: 'SKU_NOT_FOUND',
          message: `SKU ${item.offer_id} не найден в каталоге Wildberries. Убедитесь, что товар добавлен в личный кабинет и прошел модерацию.`
        }]
      }));
      
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    if (response.status === 401 || response.status === 403) {
      console.error('🔐 Ошибка авторизации:', response.status);
      
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
    
    // Неожиданная ошибка
    console.error('🚫 Неожиданный статус:', response.status, responseText);
    
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
    
  } catch (error) {
    console.error('💥 Общая ошибка:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Неизвестная ошибка сервера' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
