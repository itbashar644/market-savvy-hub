
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WB_API_URL = 'https://marketplace-api.wildberries.ru';

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

    // Сначала получаем список складов
    console.log('Getting warehouses list...');
    const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000)
    });

    console.log('Warehouses API response status:', warehousesResponse.status);
    
    if (!warehousesResponse.ok) {
      const errorText = await warehousesResponse.text();
      console.log('Warehouses API error:', warehousesResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка получения складов: ${warehousesResponse.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const warehousesData = await warehousesResponse.json();
    console.log('Warehouses received:', warehousesData);

    // Теперь попробуем получить товары через Content API
    console.log('Trying Content API...');
    const contentResponse = await fetch(`https://suppliers-api.wildberries.ru/content/v2/get/cards/list`, {
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

    console.log('Content API response status:', contentResponse.status);

    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      console.log('Content API response received, cards count:', contentData.cards?.length || 0);

      if (!contentData.cards || !Array.isArray(contentData.cards)) {
        return new Response(JSON.stringify({ 
          products: [],
          warehouses: warehousesData,
          message: 'Товары не найдены или нет доступа к Content API'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Преобразуем данные в удобный формат
      const products = [];
      
      for (const card of contentData.cards) {
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
                price: null,
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
        warehouses: warehousesData,
        total: products.length,
        cards_count: contentData.cards.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else {
      // Если Content API не работает, попробуем получить товары через Statistics API
      console.log('Content API failed, trying Statistics API...');
      
      const statsResponse = await fetch(`${WB_API_URL}/api/v1/supplier/stocks`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      console.log('Statistics API response status:', statsResponse.status);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Statistics API response received, items count:', statsData.length || 0);

        const products = (statsData || []).map((item: any) => ({
          nm_id: item.nmId,
          sku: item.barcode,
          title: item.subject || 'Без названия',
          brand: item.brand || '',
          category: item.category || '',
          article: item.supplierArticle || '',
          size: item.techSize || '',
          color: '',
          photos: [],
          videos: [],
          description: '',
          characteristics: [],
          tags: [],
          status: 'active',
          price: item.price || null,
          discount_price: item.discountedPrice || null,
          rating: 0,
          feedbacks_count: 0,
          stock_quantity: item.quantity || 0,
          warehouse_id: item.warehouseId || null,
          barcode: item.barcode
        }));

        return new Response(JSON.stringify({ 
          products,
          warehouses: warehousesData,
          total: products.length,
          source: 'statistics_api'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else {
        const errorText = await statsResponse.text();
        console.log('Statistics API error:', statsResponse.status, errorText);
        
        return new Response(JSON.stringify({ 
          error: `Не удалось получить товары ни через Content API, ни через Statistics API`,
          warehouses: warehousesData,
          products: [],
          details: {
            content_api_status: contentResponse.status,
            statistics_api_status: statsResponse.status,
            statistics_api_error: errorText
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

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
