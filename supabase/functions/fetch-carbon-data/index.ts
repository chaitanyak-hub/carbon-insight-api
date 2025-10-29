import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    let allSites: any[] = [];
    let offset = 0;
    let hasMore = true;
    const limit = 100; // API seems to cap at 100 per request

    while (hasMore) {
      const url = `http://domestic-prod-alb-terra-1678302567.eu-west-1.elb.amazonaws.com:6777/v3/site-activity?utmSource=EDF&siteType=ndomestic&includeSiteDetails=true&limit=${limit}&offset=${offset}`;
      
      console.log(`Fetching page with offset ${offset}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'e_api_key': apiKey,
        },
      });

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data?.sites) {
        allSites = [...allSites, ...data.data.sites];
        console.log(`Fetched ${data.data.sites.length} sites, total so far: ${allSites.length}`);
      }

      hasMore = data.data?.summary?.pagination?.hasMore || false;
      offset += limit;

      if (!hasMore) {
        console.log(`Successfully fetched all ${allSites.length} sites`);
      }
    }

    // Return combined data with updated summary
    const responseData = {
      code: 200,
      status: "Success",
      data: {
        summary: {
          totalSites: allSites.length,
          returnedSites: allSites.length,
          dateRange: {
            from: "2024-01-01T00:00:00",
            to: new Date().toISOString().split('T')[0] + "T23:59:00"
          },
          agentFilter: "all",
          siteDetailsIncluded: true,
          pagination: {
            limit: allSites.length,
            offset: 0,
            currentPage: 1,
            totalPages: 1,
            hasMore: false
          }
        },
        sites: allSites
      }
    };

    return new Response(JSON.stringify(responseData), {
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
