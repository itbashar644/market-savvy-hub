
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
    let body;
    const text = await req.text();
    
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    } else {
      body = {};
    }

    const apiKey = body.apiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'API ключ обязателен' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Checking Wildberries connection with API key length:', apiKey.length);

    // Тестируем API ключ запросом к информации о складах
    const response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/warehouses`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (response.status === 200) {
      const data = await response.json();
      console.log('Wildberries connection successful');

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
    } else if (response.status === 401 || response.status === 403) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Неверный API ключ или недостаточно прав доступа'
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
          error: `Ошибка API Wildberries (${response.status})`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in Wildberries connection check:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Внутренняя ошибка сервера при проверке подключения'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
