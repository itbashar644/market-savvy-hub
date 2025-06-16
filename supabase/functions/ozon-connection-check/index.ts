
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== OZON CONNECTION CHECK STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing POST request...');
    
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { marketplace, apiKey, clientId } = requestBody;
    console.log('Extracted values:');
    console.log('- Marketplace:', marketplace);
    console.log('- API key provided:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');
    console.log('- Client ID provided:', clientId ? 'YES (length: ' + clientId.length + ')' : 'NO');

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
    console.log('Using Client-Id:', clientId.substring(0, 6) + '...');
    console.log('Using Api-Key:', apiKey.substring(0, 10) + '...');

    // Используем endpoint для получения складов - базовый endpoint для всех продавцов
    const ozonResponse = await fetch('https://api-seller.ozon.ru/v1/warehouse/list', {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log('Ozon API response status:', ozonResponse.status);
    console.log('Ozon API response headers:', Object.fromEntries(ozonResponse.headers.entries()));

    if (!ozonResponse.ok) {
      const errorText = await ozonResponse.text();
      console.error('Ozon API error:', ozonResponse.status, errorText);
      
      let errorMessage = 'Ошибка подключения к API Ozon';
      
      if (ozonResponse.status === 401) {
        errorMessage = 'Неверный API ключ или Client ID. Проверьте правильность введенных данных.';
      } else if (ozonResponse.status === 403) {
        errorMessage = 'Недостаточно прав доступа. Проверьте права API ключа в личном кабинете Ozon.';
      } else if (ozonResponse.status === 404) {
        errorMessage = 'API endpoint не найден. Возможно, API ключ не активен или Client ID неверный.';
      } else {
        errorMessage = `Ошибка подключения к Ozon API (${ozonResponse.status}): ${errorText}`;
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

    const responseData = await ozonResponse.json();
    console.log('Ozon connection successful, warehouse data:', JSON.stringify(responseData, null, 2));

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
    console.error('CRITICAL ERROR in Ozon connection check:', error);
    console.error('Error stack:', error.stack);
    
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
