
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

    console.log('Updating stocks for warehouse:', warehouseId, 'original stocks count:', stocks.length);
    console.log('Original stocks data:', stocks);

    // Добавляем валидацию и логирование
    const validStocks = stocks
      .filter((stock: any) => {
        const barcode = stock.sku || stock.barcode;
        const isValid = Boolean(barcode) && Number.isInteger(stock.amount);
        
        if (!isValid) {
          console.warn('Invalid stock item:', stock);
        }
        
        return isValid;
      })
      .map((stock: any) => ({
        sku: stock.sku || stock.barcode,
        amount: Number(stock.amount)
      }));

    // Логируем итоговые данные для запроса
    console.log('Prepared stocks for WB API:', validStocks);
    console.log('Valid stocks count:', validStocks.length, 'from original:', stocks.length);

    if (validStocks.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Нет валидных товаров для обновления остатков' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Формируем тело запроса
    const body = {
      stocks: validStocks
    };

    console.log('Request body for WB API:', JSON.stringify(body, null, 2));

    // Обновляем остатки на складе (PUT метод к правильному endpoint)
    const response = await fetch(`https://marketplace-api.wildberries.ru/api/v3/stocks/${warehouseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('WB stocks update response status:', response.status);
    console.log('WB stocks update response headers:', Object.fromEntries(response.headers.entries()));

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
      originalCount: stocks.length,
      validCount: validStocks.length,
      updatedCount: validStocks.length,
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
