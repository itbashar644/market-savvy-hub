
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WB_API_URL = 'https://suppliers-api.wildberries.ru';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { stocks, apiKey } = await req.json();

    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('"stocks" array is required in the request body.');
    }
    
    if (!apiKey) {
      throw new Error('Wildberries API key is required in the request body.');
    }

    if (stocks.length === 0) {
      return new Response(JSON.stringify({ result: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Syncing stocks to Wildberries for', stocks.length, 'items');

    // Получаем список складов
    const warehousesResponse = await fetch(`${WB_API_URL}/api/v3/warehouses`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      }
    });

    if (!warehousesResponse.ok) {
      const errorText = await warehousesResponse.text();
      console.error('Wildberries Warehouses API Error:', warehousesResponse.status, errorText);
      throw new Error(`Failed to get warehouses: ${warehousesResponse.status} ${errorText}`);
    }

    const warehousesData = await warehousesResponse.json();
    console.log('Wildberries warehouses:', warehousesData);

    if (!warehousesData || warehousesData.length === 0) {
      throw new Error('No warehouses found in Wildberries account');
    }

    const warehouseId = warehousesData[0].id; // Используем первый склад

    // Обновляем остатки - исправляем URL
    const wbPayload = {
      stocks: stocks.map(item => ({
        sku: item.offer_id,
        amount: item.stock,
        warehouseId: warehouseId
      }))
    };

    console.log('Sending stocks update to Wildberries:', wbPayload);

    const response = await fetch(`${WB_API_URL}/api/v3/stocks/${warehouseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify(wbPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Wildberries Stock Update Error:', responseData);
      const allErrors = stocks.map(item => ({
        offer_id: item.offer_id,
        updated: false,
        errors: [
          {
            code: responseData.errorText || 'API_ERROR',
            message: responseData.errorText || `Wildberries API request failed with status ${response.status}`,
          },
        ],
      }));
      return new Response(JSON.stringify({ result: allErrors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Wildberries stock update response:', responseData);

    // Формируем результат в формате, совместимом с Ozon
    const result = stocks.map(item => ({
      offer_id: item.offer_id,
      updated: true,
      errors: []
    }));
    
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error syncing stocks to Wildberries:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
