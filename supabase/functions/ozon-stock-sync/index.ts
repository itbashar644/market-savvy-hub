
// v1.2 - Add warehouse_id support
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const OZON_API_URL = 'https://api-seller.ozon.ru';

// Helper function to chunk an array
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { stocks, warehouseId } = await req.json();

    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('"stocks" array is required in the request body.');
    }
    
    if (!warehouseId) {
      throw new Error('"warehouseId" is required in the request body.');
    }

    if (stocks.length === 0) {
      return new Response(JSON.stringify({ result: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const ozonClientId = Deno.env.get('OZON_CLIENT_ID');
    const ozonApiKey = Deno.env.get('OZON_API_KEY');

    if (!ozonClientId || !ozonApiKey) {
      throw new Error('Ozon API credentials are not set in environment variables.');
    }

    const parsedWarehouseId = parseInt(warehouseId, 10);
    if (isNaN(parsedWarehouseId) || parsedWarehouseId <= 0) {
      throw new Error('Invalid "warehouseId". It must be a positive number.');
    }

    const stockChunks = chunk(stocks, 100); // Ozon API limit is 100 items per request
    let allResults: any[] = [];

    for (const stockChunk of stockChunks) {
      const ozonPayload = {
        stocks: stockChunk.map(item => ({
          offer_id: item.offer_id,
          stock: item.stock,
          warehouse_id: parsedWarehouseId,
        }))
      };

      try {
        const response = await fetch(`${OZON_API_URL}/v2/products/stocks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': ozonClientId,
            'Api-Key': ozonApiKey,
          },
          body: JSON.stringify(ozonPayload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Ozon API Error for a chunk:', responseData);
          const chunkErrors = stockChunk.map(item => ({
              offer_id: item.offer_id,
              updated: false,
              errors: [
                  {
                      code: responseData.code || 'FETCH_ERROR',
                      message: responseData.message || `Ozon API request failed with status ${response.status}`,
                  },
              ],
          }));
          allResults = [...allResults, ...chunkErrors];
        } else {
          allResults = [...allResults, ...responseData.result];
        }
      } catch (e) {
        console.error('Network error or failed to fetch from Ozon API for a chunk:', e);
        const chunkErrors = stockChunk.map(item => ({
            offer_id: item.offer_id,
            updated: false,
            errors: [
                {
                    code: 'NETWORK_ERROR',
                    message: e.message,
                },
            ],
        }));
        allResults = [...allResults, ...chunkErrors];
      }
    }
    
    return new Response(JSON.stringify({ result: allResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
