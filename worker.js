export default {
  async fetch(request, env) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Process API requests
    if (request.url.endsWith('/api/chat') && request.method === 'POST') {
      try {
        const { prompt, language } = await request.json();
        
        // Add language context to prompt
        const fullPrompt = language === 'my' 
          ? `မြန်မာဘာသာဖြင့်ဖြေပါ။ ${prompt}`
          : prompt;

        const response = await env.WAYNE_API_KEY.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            prompt: fullPrompt,
            max_tokens: 1000
          }
        );
        
        return new Response(JSON.stringify({ 
          response: response.response || response 
        }), {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        });
      } catch (error) {
        console.error('Worker Error:', error);
        return new Response(JSON.stringify({ 
          error: "AI service unavailable",
          details: error.message 
        }), { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        });
      }
    }

    // Serve frontend files
    return fetch('https://smartburme.github.io/wayne-dev' + new URL(request.url).pathname);
  }
}
