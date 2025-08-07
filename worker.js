export default {
  async fetch(request, env) {
    // CORS စီမံခန့်ခွဲမှု
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { prompt, language } = await request.json();
      
      const aiResponse = await env.WAYNE_API_KEY.run(
        "@cf/meta/llama-3.1-8b-instruct", 
        {
          prompt: language === 'my' ? 
            `မြန်မာဘာသာဖြင့်ဖြေပါ: ${prompt}` : prompt,
          max_tokens: 1000
        }
      );

      return new Response(JSON.stringify({
        response: aiResponse.response || aiResponse
      }), {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        error: "တောင်းပန်ပါသည်။ ယာယီပြဿနာရှိနေပါသည်။",
        details: error.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}
