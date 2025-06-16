
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WB_API_URL = 'https://suppliers-api.wildberries.ru';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      throw new Error('Wildberries API key is required in the request body.');
    }

    console.log('Fetching products from Wildberries...');

    // Получаем список карточек товаров через Suppliers API
    const response = await fetch(`${WB_API_URL}/content/v2/get/cards/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'User-Agent': 'Supabase-Edge-Function/1.0',
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
      signal: AbortSignal.timeout(30000)
    });

    console.log('Suppliers API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Suppliers API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка API Wildberries: ${response.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const data = await response.json();
    console.log('Suppliers API response received, cards count:', data.cards?.length || 0);

    if (!data.cards || !Array.isArray(data.cards)) {
      return new Response(JSON.stringify({ 
        products: [],
        message: 'Товары не найдены или нет доступа к API'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Преобразуем данные в удобный формат
    const products = [];
    
    for (const card of data.cards) {
      try {
        // Извлекаем размеры и SKU
        const sizes = card.sizes || [];
        
        for (const size of sizes) {
          const skus = size.skus || [];
          
          for (const sku of skus) {
            products.push({
              nm_id: card.nmID,
              sku: sku,
              title: card.object || 'Без названия',
              brand: card.brand || '',
              category: card.subjectName || '',
              article: card.vendorCode || '',
              size: size.techSize || '',
              color: card.colors?.[0] || '',
              photos: card.photos || [],
              videos: card.video || [],
              description: card.description || '',
              characteristics: card.characteristics || [],
              tags: card.tags || [],
              status: 'active',
              price: null, // Цена может быть получена через другой API
              discount_price: null,
              rating: 0,
              feedbacks_count: 0,
              stock_quantity: 0,
              warehouse_id: null,
              barcode: size.skus?.[0] || sku
            });
          }
        }
      } catch (cardError) {
        console.error('Error processing card:', cardError, card);
      }
    }

    console.log('Processed products count:', products.length);

    return new Response(JSON.stringify({ 
      products,
      total: products.length,
      cards_count: data.cards.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error fetching Wildberries products:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Ошибка при получении товаров',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
