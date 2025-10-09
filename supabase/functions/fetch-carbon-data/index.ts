import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching carbon data from Labrador API...');
    
    const apiKey = Deno.env.get('LABRADOR_E_API_KEY');
    
    if (!apiKey) {
      console.error('LABRADOR_E_API_KEY not found');
      throw new Error('API key not configured');
    }

    const response = await fetch(
      'https://api.thelabrador.co.uk/carbon/v3/site-activity?utmSource=edf&siteType=ndomestic',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'e_api_key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched carbon data');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-carbon-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'Check function logs for more information'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
