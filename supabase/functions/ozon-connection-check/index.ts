
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
    const body = await req.json();
    const { apiKey, clientId } = body;

    console.log('Received request body:', body);
    console.log('API key present:', !!apiKey);
    console.log('Client ID present:', !!clientId);

    if (!apiKey || !clientId) {
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

    console.log('Checking Ozon connection with clientId:', clientId);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ozon API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Неверный API ключ или Client ID' 
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
            error: 'Недостаточно прав доступа. Проверьте права API ключа.' 
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
