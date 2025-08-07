export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API endpoint for chat
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { prompt, language } = await request.json();
        
        // Add Myanmar language context if needed
        const fullPrompt = language === 'my' ? 
          `မြန်မာဘာသာဖြင့်ဖြေပါ။ ${prompt}` : 
          prompt;
        
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "AI ဝန်ဆောင်မှုယာယီရပ်နားထားသည်" 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Serve static files
    return env.ASSETS.fetch(request);
  }
}
