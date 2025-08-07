document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.appendChild(progressBar);
    document.body.insertBefore(progressContainer, document.body.firstChild);

    // Cloudflare Worker API endpoint
    const WORKER_API_URL = 'https://morning-cell-1282.mysvm.workers.dev/api/chat';

    // Initialize settings
    checkSettings();

    // Myanmar time formatting
    function getMyanmarTime() {
        const now = new Date();
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        };
        return now.toLocaleTimeString('my-MM', options);
    }

    // Typing indicator functions
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span>WAYNE AI စာရိုက်နေသည်...</span>
        `;
        typingDiv.id = 'typingIndicator';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Message handling
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message, getMyanmarTime());
            userInput.value = '';
            
            // Show progress
            progressBar.style.width = '30%';
            showTypingIndicator();
            
            // Get AI response
            getAIResponse(message)
                .then(response => {
                    progressBar.style.width = '100%';
                    hideTypingIndicator();
                    addMessage('ai', response, getMyanmarTime());
                    
                    // Text-to-speech if enabled
                    if (localStorage.getItem('voiceResponse') === 'true') {
                        speakResponse(response);
                    }
                    
                    setTimeout(() => {
                        progressBar.style.width = '0%';
                    }, 500);
                })
                .catch(error => {
                    progressBar.style.width = '0%';
                    hideTypingIndicator();
                    addMessage('ai', "တောင်းပန်ပါသည်။ အမှားတစ်ခုဖြစ်ပေါ်နေပါသည်။", getMyanmarTime());
                    console.error('API Error:', error);
                });
        }
    }

    function addMessage(sender, text, time) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        const messageContent = document.createElement('div');
        messageContent.textContent = text;
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = time;
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timeSpan);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Text-to-speech function
    function speakResponse(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = localStorage.getItem('language') === 'en' ? 'en-US' : 'my-MM';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Settings management
    function checkSettings() {
        if (!localStorage.getItem('language')) {
            localStorage.setItem('language', 'my');
        }
        
        if (!localStorage.getItem('voiceResponse')) {
            localStorage.setItem('voiceResponse', 'false');
        }
        
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // API communication with Cloudflare Worker
    async function getAIResponse(prompt) {
        try {
            const response = await fetch(WORKER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: prompt,
                    language: localStorage.getItem('language') || 'my'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.response) {
                throw new Error('Invalid response format from API');
            }
            
            return data.response;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Event listeners
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);

    // Initial greeting
    setTimeout(() => {
        addMessage('ai', "မင်္ဂလာပါ! WAYNE AI မှ ကြိုဆိုပါတယ်။ ကျွန်ုပ်ကို ဘာတွေ မေးမြန်းချင်ပါသလဲ?", getMyanmarTime());
    }, 1000);
});
