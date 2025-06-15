
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const OZON_API_URL = 'https://api-seller.ozon.ru';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { stocks } = await req.json();

    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('"stocks" array is required in the request body.');
    }

    const ozonClientId = Deno.env.get('OZON_CLIENT_ID');
    const ozonApiKey = Deno.env.get('OZON_API_KEY');

    if (!ozonClientId || !ozonApiKey) {
      throw new Error('Ozon API credentials are not set in environment variables.');
    }

    const ozonPayload = {
      stocks: stocks.map(item => ({
        offer_id: item.offer_id,
        stock: item.stock
      }))
    };
    
    const response = await fetch(`${OZON_API_URL}/v2/products/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': ozonClientId,
        'Api-Key': ozonApiKey,
      },
      body: JSON.stringify(ozonPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Ozon API Error:', errorData);
        throw new Error(`Ozon API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();

    return new Response(JSON.stringify(data), {
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
