import { log } from '../_shared/logger.ts';

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  log('=== WILDBERRIES CONNECTION CHECK STARTED ===');
  log('Request method:', req.method);
  log('Request URL:', req.url);
  log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log('Processing POST request...');
    
    const requestBody = await req.json();
    log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { marketplace, apiKey } = requestBody;
    log('Extracted values:');
    log('- Marketplace:', marketplace);
    log('- API key provided:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');

    if (!apiKey) {
      log('ERROR: API ключ не предоставлен');
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

    log('Attempting to connect to Wildberries API...');
    log('API key being used:', apiKey.substring(0, 20) + '...');
    
    let response;
    try {
      log('Making API request to Wildberries warehouses endpoint...');
      
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

      log('Wildberries API Response status:', response.status);
      log('Wildberries API Response headers:', Object.fromEntries(response.headers.entries()));
      
    } catch (fetchError) {
      console.error('Network error during fetch:', fetchError);
      console.error('Fetch error stack:', fetchError.stack);
      
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
    log('Raw response text length:', responseText.length);
    log('Raw response preview:', responseText.substring(0, 500));

    if (response.status === 200) {
      let data;
      try {
        data = JSON.parse(responseText);
        log('Parsed response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response text that failed to parse:', responseText);
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

      log('Wildberries connection successful!');

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
    console.error('CRITICAL ERROR in Wildberries connection check:', error);
    console.error('Error stack:', error.stack);
    
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
