# WAYNE AI Power Website Project Structure

ဒီတစ်ခုက အဆင့်မြင့် project structure နဲ့ Cloudflare Workers AI (Llama model) ကိုအသုံးပြုတဲ့ website တစ်ခုဖြစ်ပါတယ်။

## Project Structure

```
wayne-ai-website/
├── index.html                  # Loading page (redirects to main.html)
├── src/
│   ├── pages/
│   │   ├── main.html           # Main chat interface
│   │   ├── setting.html        # Settings page
│   │   └── about.html          # About page
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css        # Chat UI styling
│   │   └── js/
│   │       └── main.js         # Chat logic and API calls
└── worker.js                   # Cloudflare Worker
```

## File Contents

### 1. index.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>WAYNE AI - Loading</title>
    <meta http-equiv="refresh" content="2; url='src/pages/main.html'">
    <style>
        .loader {
            border: 16px solid #f3f3f3;
            border-top: 16px solid #3498db;
            border-radius: 50%;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
            margin: 100px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loader"></div>
</body>
</html>
```

### 2. src/pages/main.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>WAYNE AI - Chat</title>
    <link rel="stylesheet" href="../../src/assets/css/main.css">
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h1>WAYNE AI</h1>
            <nav>
                <a href="setting.html">Settings</a>
                <a href="about.html">About</a>
            </nav>
        </div>
        <div class="chat-body" id="chatBody">
            <!-- Messages will appear here -->
        </div>
        <div class="chat-input">
            <input type="text" id="userInput" placeholder="Ask me anything...">
            <button id="sendButton">Send</button>
        </div>
    </div>
    <script src="../../src/assets/js/main.js"></script>
</body>
</html>
```

### 3. src/assets/css/main.css
```css
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}

.chat-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.chat-header {
    background-color: #2c3e50;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header nav a {
    color: white;
    margin-left: 15px;
    text-decoration: none;
}

.chat-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.message {
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 18px;
    max-width: 70%;
}

.user-message {
    background-color: #e3f2fd;
    margin-left: auto;
    border-bottom-right-radius: 5px;
}

.ai-message {
    background-color: #f1f1f1;
    margin-right: auto;
    border-bottom-left-radius: 5px;
}

.chat-input {
    display: flex;
    padding: 15px;
    border-top: 1px solid #eee;
}

.chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
}

.chat-input button {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #2c3e50;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}
```

### 4. src/assets/js/main.js
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Add initial greeting
    addMessage('ai', 'Hello! I am WAYNE AI. How can I help you today?');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';
            
            // Call AI API
            getAIResponse(message).then(response => {
                addMessage('ai', response);
            });
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        messageDiv.textContent = text;
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function getAIResponse(prompt) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            const data = await response.json();
            return data.response || "I couldn't process that request.";
        } catch (error) {
            console.error('Error:', error);
            return "Sorry, there was an error processing your request.";
        }
    }
});
```

### 5. worker.js (Cloudflare Worker)
```javascript
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
```

## Deployment Instructions

1. **Cloudflare Worker Setup**:
   - Create a new Worker in Cloudflare dashboard
   - Add the `worker.js` code
   - Bind your `WAYNE_API_KEY` (Workers AI) and `ASSETS` (for static files)

2. **Static Files**:
   - Upload all HTML, CSS, and JS files to Cloudflare Pages or R2 bucket
   - Configure the `ASSETS` binding in your Worker

3. **Routes**:
   - Set up route in Cloudflare to direct traffic to your Worker (e.g., `*.yourdomain.com/*`)

## Features

1. Modern loading screen with redirect
2. Clean chat interface with message bubbles
3. Navigation to settings and about pages
4. Full integration with Llama 3.1 8B model via Cloudflare Workers AI
5. Error handling for API failures
6. Responsive design

ဒီ project structure ကိုု Cloudflare Workers AI နဲ့အတူ အသုံးပြုဖို့ အဆင်သင့်ဖြစ်ပါပြီ။ setting.html နဲ့ about.html ကိုု သင့်စိတ်ကြိုက် design လုပ်နိုင်ပါတယ်။
