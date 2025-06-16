
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
    console.log('=== Wildberries Connection Check Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    const { marketplace, apiKey } = requestBody;
    console.log('Marketplace from body:', marketplace);
    console.log('API key received:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');

    if (!apiKey) {
      console.log('ERROR: API ключ не предоставлен');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API ключ обязателен для проверки подключения' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Attempting to connect to Wildberries API...');
    console.log('API key being used:', apiKey.substring(0, 10) + '...');
    
    let response;
    try {
      console.log('Making API request to Wildberries...');
      
      // Пробуем получить информацию о складах через API v3
      response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/warehouses`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
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

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (response.status === 200) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Получен некорректный ответ от API Wildberries'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Wildberries connection successful, warehouses:', data);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Подключение к Wildberries успешно установлено. Найдено складов: ${Array.isArray(data) ? data.length : 0}.`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (response.status === 401 || response.status === 403) {
      console.error('Wildberries API authentication error:', response.status, responseText);
      
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
      console.error('Rate limit exceeded');
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
      console.error('Wildberries API error:', response.status, responseText);
      
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
