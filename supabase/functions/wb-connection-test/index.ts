
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey, warehouseId } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API ключ обязателен' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Testing WB API connection using ping endpoint');

    // Проверяем подключение через ping endpoint
    const pingResponse = await fetch(`https://marketplace-api.wildberries.ru/ping`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      },
    });

    console.log('WB ping API response status:', pingResponse.status);

    if (pingResponse.ok) {
      console.log('WB ping successful');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Подключение к Wildberries успешно установлено`,
        warehouseId: warehouseId || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorText = await pingResponse.text();
      console.log('WB ping API error:', pingResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Ошибка API Wildberries: ${pingResponse.status} - ${errorText}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error testing WB connection:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Ошибка при проверке подключения: ' + error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
