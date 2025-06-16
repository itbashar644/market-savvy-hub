
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Попробуем использовать более простой endpoint для проверки
    let response;
    try {
      console.log('Attempting to connect to Wildberries API...');
      
      response = await fetch('https://suppliers-api.wildberries.ru/api/v3/warehouses', {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        signal: AbortSignal.timeout(30000) // Увеличиваем таймаут до 30 секунд
      });

      console.log('Response received with status:', response.status);
      
    } catch (fetchError) {
      console.error('Network error during fetch:', fetchError);
      
      // Попробуем альтернативный подход - проверим другой endpoint
      try {
        console.log('Trying alternative endpoint...');
        response = await fetch('https://suppliers-api.wildberries.ru/public/api/v1/info', {
          method: 'GET',
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0',
          },
          signal: AbortSignal.timeout(30000)
        });
        console.log('Alternative endpoint response status:', response.status);
      } catch (altError) {
        console.error('Alternative endpoint also failed:', altError);
        
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
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wildberries API error:', response.status, errorText);
      
      let errorMessage = 'Ошибка подключения к Wildberries API';
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Неверный API ключ или недостаточно прав доступа';
      } else if (response.status === 429) {
        errorMessage = 'Слишком много запросов. Попробуйте позже';
      } else if (response.status >= 500) {
        errorMessage = 'Сервер Wildberries временно недоступен';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('Wildberries connection successful, response data:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Подключение к Wildberries успешно установлено'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Full error in Wildberries connection check:', error);
    
    let errorMessage = 'Внутренняя ошибка сервера';
    if (error.name === 'TimeoutError') {
      errorMessage = 'Таймаут подключения к Wildberries API';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Ошибка сети при подключении к Wildberries';
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Не удается подключиться к серверам Wildberries';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
