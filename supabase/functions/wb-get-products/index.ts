
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API ключ обязателен' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Getting products from WB...');

    // Получаем список карточек товаров
    const response = await fetch('https://marketplace-api.wildberries.ru/content/v2/get/cards/list', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: {
          sort: {
            ascending: false
          },
          filter: {
            withPhoto: -1
          }
        }
      }),
    });

    console.log('WB products API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('WB products API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка получения товаров: ${response.status} - ${errorText}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const data = await response.json();
    console.log('WB products response received, cards count:', data.cards?.length || 0);

    if (!data.cards || !Array.isArray(data.cards)) {
      return new Response(JSON.stringify({ 
        products: [],
        total: 0,
        message: 'Товары не найдены'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Преобразуем данные карточек в нужный формат
    const products = [];
    
    for (const card of data.cards) {
      if (card.sizes && Array.isArray(card.sizes)) {
        for (const size of card.sizes) {
          if (size.skus && Array.isArray(size.skus)) {
            for (const sku of size.skus) {
              products.push({
                nm_id: card.nmID || 0,
                sku: sku || '',
                title: card.title || 'Без названия',
                brand: card.brand || '',
                category: card.object || '',
                article: card.vendorCode || '',
                size: size.optionID || '',
                color: '',
                photos: card.photos || [],
                videos: card.video || [],
                description: card.description || '',
                characteristics: card.characteristics || [],
                tags: card.tags || [],
                status: 'active',
                price: null,
                discount_price: null,
                rating: 0,
                feedbacks_count: 0,
                stock_quantity: 0,
                warehouse_id: null,
                barcode: sku || ''
              });
            }
          }
        }
      }
    }

    console.log('Processed products count:', products.length);

    return new Response(JSON.stringify({ 
      products,
      total: products.length,
      source: 'content_api'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error getting WB products:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Ошибка при получении товаров: ' + error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
