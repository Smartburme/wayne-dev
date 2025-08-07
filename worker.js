export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API endpoint for chat
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { prompt } = await request.json();
        
        const response = await env.WAYNE_API_KEY.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            prompt: prompt,
            max_tokens: 1000
          }
        );
        
        return new Response(JSON.stringify({ 
          response: response.response || response 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "AI service unavailable" 
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
