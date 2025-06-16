
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

    // Получаем товары через Statistics API - это единственный рабочий метод
    console.log('Fetching products via Statistics API...');
    const statsResponse = await fetch(`${WB_API_URL}/api/v1/supplier/stocks`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000)
    });

    console.log('Statistics API response status:', statsResponse.status);

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.log('Statistics API error:', statsResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Ошибка получения товаров через Statistics API: ${statsResponse.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const statsData = await statsResponse.json();
    console.log('Statistics API response received, items count:', statsData.length || 0);

    if (!Array.isArray(statsData)) {
      return new Response(JSON.stringify({ 
        products: [],
        message: 'Товары не найдены',
        total: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Преобразуем данные в нужный формат
    const products = statsData.map((item: any) => ({
      nm_id: item.nmId || 0,
      sku: item.barcode || '',
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
      barcode: item.barcode || ''
    }));

    console.log('Processed products count:', products.length);

    return new Response(JSON.stringify({ 
      products,
      total: products.length,
      source: 'statistics_api'
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
