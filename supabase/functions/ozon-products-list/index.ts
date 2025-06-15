
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const OZON_API_URL = 'https://api-seller.ozon.ru';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey, clientId } = await req.json();

    if (!apiKey || !clientId) {
      throw new Error('Ozon API credentials (apiKey, clientId) are required.');
    }

    console.log('Fetching Ozon products list');

    const response = await fetch(`${OZON_API_URL}/v2/product/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        filter: {
          visibility: 'ALL'
        },
        last_id: '',
        limit: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ozon API Error:', response.status, errorText);
      throw new Error(`Ozon API request failed: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Successfully fetched Ozon products');

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching Ozon products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
