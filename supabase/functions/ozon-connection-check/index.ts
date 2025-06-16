
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('=== Ozon Connection Check Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const requestBody = await req.json();
    console.log('Request body received:', requestBody);

    const { marketplace, apiKey } = requestBody;
    console.log('Marketplace:', marketplace);
    console.log('API key provided:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');

    // Получаем Client ID из тела запроса
    const clientId = requestBody.clientId;
    console.log('Client ID provided:', clientId ? 'YES (length: ' + clientId.length + ')' : 'NO');

    if (!apiKey || !clientId) {
      console.log('ERROR: Missing required credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API ключ и Client ID обязательны' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Making request to Ozon API...');
    console.log('Using Client-Id:', clientId.substring(0, 10) + '...');
    console.log('Using Api-Key:', apiKey.substring(0, 10) + '...');

    // Используем endpoint для получения складов - базовый endpoint для всех продавцов
    const response = await fetch('https://api-seller.ozon.ru/v1/warehouse/list', {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log('Ozon API response status:', response.status);
    console.log('Ozon API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ozon API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Неверный API ключ или Client ID. Проверьте правильность введенных данных.' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Недостаточно прав доступа. Проверьте права API ключа в личном кабинете Ozon.' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'API endpoint не найден. Возможно, API ключ не активен или Client ID неверный.' 
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
            error: `Ошибка подключения к Ozon API (${response.status}): ${errorText}` 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const responseData = await response.json();
    console.log('Ozon connection successful, warehouse data:', responseData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Подключение к Ozon успешно установлено',
        warehouseData: responseData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error checking Ozon connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Внутренняя ошибка сервера: ${error.message}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
