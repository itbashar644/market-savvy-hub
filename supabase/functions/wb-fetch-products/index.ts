
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

    console.log('Fetching products from WB warehouse:', warehouseId);

    // Получаем остатки товаров с указанного склада (GET метод)
    const response = await fetch(`https://suppliers-api.wildberries.ru/api/v1/supplier/stocks?warehouseId=${warehouseId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      },
    });

    console.log('WB API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('WB API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка получения товаров: ${response.status} - ${errorText}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const data = await response.json();
    console.log('WB API response received, stocks count:', data?.length || 0);

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ 
        products: [],
        total: 0,
        message: 'Товары не найдены на складе'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Преобразуем данные об остатках в формат товаров
    const products = data.map((stock: any) => ({
      nm_id: stock.nmId || 0,
      sku: stock.barcode || stock.sku || '',
      title: stock.subject || 'Товар без названия',
      brand: stock.brand || '',
      category: stock.category || '',
      article: stock.vendorCode || '',
      size: stock.techSize || '',
      color: '',
      photos: [],
      videos: [],
      description: '',
      characteristics: [],
      tags: [],
      status: 'active',
      price: stock.Price || null,
      discount_price: stock.Discount || null,
      rating: 0,
      feedbacks_count: 0,
      stock_quantity: (stock.inWayToClient || 0) + (stock.inWayFromClient || 0) + (stock.quantityFull || 0),
      warehouse_id: parseInt(warehouseId),
      barcode: stock.barcode || ''
    }));

    console.log('Processed products count:', products.length);

    return new Response(JSON.stringify({ 
      products,
      total: products.length,
      warehouseId: parseInt(warehouseId),
      source: 'stocks_api'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error fetching WB products:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Ошибка при получении товаров: ' + error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
