
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

    // Проверяем подключение через получение списка складов
    const warehousesResponse = await fetch(`https://suppliers-api.wildberries.ru/api/v1/warehouses`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      },
    });

    console.log('WB warehouses API response status:', warehousesResponse.status);

    if (warehousesResponse.ok) {
      const warehouses = await warehousesResponse.json();
      console.log('WB connection successful, warehouses count:', warehouses?.length || 0);
      
      // Проверяем, существует ли указанный склад
      const warehouse = warehouses?.find((w: any) => w.id?.toString() === warehouseId.toString());
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: warehouse 
          ? `Подключение к Wildberries успешно. Склад "${warehouse.name}" найден`
          : `Подключение к Wildberries успешно. Внимание: склад с ID ${warehouseId} не найден в списке`,
        warehousesCount: warehouses?.length || 0,
        warehouseFound: !!warehouse,
        availableWarehouses: warehouses?.map((w: any) => ({ id: w.id, name: w.name })) || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorText = await warehousesResponse.text();
      console.log('WB warehouses API error:', warehousesResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Ошибка API Wildberries: ${warehousesResponse.status} - ${errorText}` 
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
