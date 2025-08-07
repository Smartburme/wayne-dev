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

    // အချက်အလက်များကိုစစ်ဆေးခြင်း
    checkSettings();

    // မြန်မာဘာသာဖြင့် အချိန်ပြခြင်း
    function getMyanmarTime() {
        const now = new Date();
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        };
        return now.toLocaleTimeString('my-MM', options);
    }

    // စာရိုက်နေသည့်အချက်ပြခြင်း
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        typingDiv.id = 'typingIndicator';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // စာရိုက်နေသည့်အချက်ဖျောက်ခြင်း
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // မက်ဆေ့ချ်ပို့ခြင်း
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message, getMyanmarTime());
            userInput.value = '';
            
            // တိုးတက်မှုဘားပြခြင်း
            progressBar.style.width = '30%';
            
            // AI မှအဖြေစောင့်ဆိုင်းခြင်း
            showTypingIndicator();
            
            // AI မှအဖြေရယူခြင်း
            getAIResponse(message)
                .then(response => {
                    progressBar.style.width = '100%';
                    hideTypingIndicator();
                    addMessage('ai', response, getMyanmarTime());
                    
                    // အသံဖြင့်ဖတ်ပြခြင်း (ရွေးချယ်ထားပါက)
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
                    console.error('Error:', error);
                });
        }
    }

    // မက်ဆေ့ချ်ထည့်ခြင်း
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

    // အသံဖြင့်ဖတ်ပြခြင်း
    function speakResponse(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = localStorage.getItem('language') === 'en' ? 'en-US' : 'my-MM';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    // အချက်အလက်များကိုစစ်ဆေးခြင်း
    function checkSettings() {
        // ဘာသာစကား
        if (!localStorage.getItem('language')) {
            localStorage.setItem('language', 'my');
        }
        
        // အသံထွက်
        if (!localStorage.getItem('voiceResponse')) {
            localStorage.setItem('voiceResponse', 'false');
        }
        
        // အသွင်အပြင်
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // AI API နှင့်ချိတ်ဆက်ခြင်း
    async function getAIResponse(prompt) {
        try {
            const response = await fetch('/api/chat', {
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
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.response || "ကျေးဇူးပြု၍ နောက်မှထပ်မေးပါ။";
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Enter နှိပ်ပါက message ပို့ခြင်း
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // ပို့ရန်ခလုတ်ကိုနှိပ်ပါက
    sendButton.addEventListener('click', sendMessage);

    // ပထမဆုံးမက်ဆေ့ချ်ကိုထည့်ခြင်း
    setTimeout(() => {
        addMessage('ai', "မင်္ဂလာပါ! WAYNE AI မှ ကြိုဆိုပါတယ်။ ကျွန်ုပ်ကို ဘာတွေ မေးမြန်းချင်ပါသလဲ?", getMyanmarTime());
    }, 1000);
});
