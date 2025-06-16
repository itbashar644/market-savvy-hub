
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

    if (!warehouseId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID склада обязателен' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Testing WB API connection with warehouse ID:', warehouseId);

    // Тестируем подключение запросом к складским остаткам
    const response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/stocks/${warehouseId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('WB API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('WB connection successful, stocks count:', data?.stocks?.length || 0);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Подключение к Wildberries успешно',
        stocksCount: data?.stocks?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorText = await response.text();
      console.log('WB API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Ошибка API Wildberries: ${response.status} - ${errorText}` 
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
