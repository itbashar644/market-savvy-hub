
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

    console.log('Checking Wildberries connection');

    // Используем более надежный способ проверки с правильными заголовками
    const response = await fetch('https://suppliers-api.wildberries.ru/api/v3/warehouses', {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 секунд таймаут
    });

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
    console.log('Wildberries connection successful, warehouses found:', data?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Подключение к Wildberries успешно установлено',
        warehouses: data?.length || 0
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
