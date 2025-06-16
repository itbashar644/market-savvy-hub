
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey, warehouseId, stocks } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API ключ обязателен' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!warehouseId) {
      return new Response(JSON.stringify({ 
        error: 'ID склада обязателен' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Данные об остатках обязательны (минимум 1 товар)' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Updating stocks for warehouse:', warehouseId, 'stocks count:', stocks.length);

    // Формируем данные в формате WB API - используем валидные баркоды
    const stocksData = stocks.map((stock: any) => ({
      sku: stock.sku || stock.barcode, // Используем баркод как SKU
      amount: stock.amount
    }));

    // Обновляем остатки на складе (PUT метод к правильному endpoint)
    const response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/stocks/${warehouseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stocks: stocksData }),
    });

    console.log('WB stocks update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('WB stocks update error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка обновления остатков: ${response.status} - ${errorText}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const result = await response.json();
    console.log('Stocks updated successfully:', result);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Остатки успешно обновлены',
      updatedCount: stocks.length,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error updating WB stocks:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Ошибка при обновлении остатков: ' + error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
