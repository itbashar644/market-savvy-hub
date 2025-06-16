
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API ключ обязателен' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Checking Wildberries connection with API key length:', apiKey.length);

    // Используем правильный домен API
    const warehouseId = 7963; // Ваш ID склада
    
    let response;
    try {
      console.log('Attempting to connect to Wildberries marketplace API...');
      
      // Пробуем получить информацию о складах через новый API
      response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('Response received with status:', response.status);
      
    } catch (fetchError) {
      console.error('Network error during fetch:', fetchError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Не удается подключиться к серверам Wildberries. Возможно, проблема с сетью или API временно недоступен.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (response.status === 200) {
      const data = await response.json();
      console.log('Wildberries connection successful, warehouses:', data);

      // Проверяем, есть ли нужный склад
      const hasWarehouse = data.some((warehouse: any) => warehouse.id === warehouseId);
      
      if (hasWarehouse) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Подключение к Wildberries успешно установлено. Найден склад с ID ${warehouseId}.`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Склад с ID ${warehouseId} не найден в вашем аккаунте. Проверьте настройки склада в личном кабинете Wildberries.`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else if (response.status === 401 || response.status === 403) {
      const errorText = await response.text();
      console.error('Wildberries API authentication error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Неверный API ключ или недостаточно прав доступа. Проверьте API ключ в личном кабинете Wildberries.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (response.status === 429) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Превышен лимит запросов к API Wildberries. Попробуйте позже.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      const errorText = await response.text();
      console.error('Wildberries API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Ошибка API Wildberries (${response.status}). Проверьте настройки API ключа.`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Full error in Wildberries connection check:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Внутренняя ошибка сервера при проверке подключения к Wildberries.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
