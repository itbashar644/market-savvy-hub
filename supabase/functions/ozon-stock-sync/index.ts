
// v1.4 - Enhanced logging and error handling
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
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
    const { stocks, warehouseId, apiKey, clientId } = await req.json();

    console.log('Received request with:', {
      stocksCount: stocks?.length || 0,
      hasWarehouseId: !!warehouseId,
      hasApiKey: !!apiKey,
      hasClientId: !!clientId
    });

    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('"stocks" array is required in the request body.');
    }
    
    if (!warehouseId) {
      throw new Error('"warehouseId" is required in the request body.');
    }
    
    if (!apiKey || !clientId) {
      throw new Error('Ozon API credentials (apiKey, clientId) are required in the request body.');
    }

    console.log('Stocks to sync:', stocks.map(s => ({ offer_id: s.offer_id, stock: s.stock })));

    if (stocks.length === 0) {
      console.log('No stocks to sync, returning empty result');
      return new Response(JSON.stringify({ result: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const parsedWarehouseId = parseInt(warehouseId, 10);
    if (isNaN(parsedWarehouseId) || parsedWarehouseId <= 0) {
      throw new Error('Invalid "warehouseId". It must be a positive number.');
    }

    console.log('Using warehouse ID:', parsedWarehouseId);

    const stockChunks = chunk(stocks, 100); // Ozon API limit is 100 items per request
    let allResults: any[] = [];

    console.log(`Processing ${stockChunks.length} chunks of stocks`);

    for (let i = 0; i < stockChunks.length; i++) {
      const stockChunk = stockChunks[i];
      console.log(`Processing chunk ${i + 1}/${stockChunks.length} with ${stockChunk.length} items`);

      const ozonPayload = {
        stocks: stockChunk.map(item => ({
          offer_id: item.offer_id,
          stock: item.stock,
          warehouse_id: parsedWarehouseId,
        }))
      };

      console.log(`Ozon API payload for chunk ${i + 1}:`, JSON.stringify(ozonPayload, null, 2));

      try {
        const response = await fetch(`${OZON_API_URL}/v2/products/stocks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': clientId,
            'Api-Key': apiKey,
          },
          body: JSON.stringify(ozonPayload),
        });

        console.log(`Ozon API response status for chunk ${i + 1}:`, response.status);

        const responseData = await response.json();
        console.log(`Ozon API response data for chunk ${i + 1}:`, JSON.stringify(responseData, null, 2));

        if (!response.ok) {
          console.error(`Ozon API Error for chunk ${i + 1}:`, responseData);
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
          console.log(`Chunk ${i + 1} processed successfully:`, responseData.result);
          allResults = [...allResults, ...responseData.result];
        }
      } catch (e) {
        console.error(`Network error or failed to fetch from Ozon API for chunk ${i + 1}:`, e);
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

    console.log('Final results summary:', {
      totalItems: allResults.length,
      successCount: allResults.filter(r => r.updated).length,
      errorCount: allResults.filter(r => !r.updated).length
    });
    
    return new Response(JSON.stringify({ result: allResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in ozon-stock-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
