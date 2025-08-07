document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const newChatBtn = document.getElementById('newChatBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyList = document.getElementById('historyList');
    const themeToggle = document.getElementById('themeToggle');
    const voiceToggle = document.getElementById('voiceToggle');
    const suggestions = document.getElementById('suggestions');
    const progressBar = document.querySelector('.progress-bar');
    
    // Cloudflare Worker API Configuration
    const API_CONFIG = {
        endpoint: 'https://morning-cell-1282.mysvm.workers.dev/api/chat',
        retries: 3,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    // Application State
    let currentChatId = generateChatId();
    let isSidebarOpen = window.innerWidth > 768;

    // Initialize the application
    initApplication();

    function initApplication() {
        setupEventListeners();
        checkSettings();
        loadChatHistory();
        updateSidebarState();
        sendInitialGreeting();
    }

    // Generate unique chat ID
    function generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Myanmar time formatting
    function getMyanmarTime(date = new Date()) {
        const options = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true,
            day: 'numeric',
            month: 'short'
        };
        return date.toLocaleDateString('my-MM', options) + ' ' + 
               date.toLocaleTimeString('my-MM', {hour: '2-digit', minute: '2-digit', hour12: true});
    }

    // Sidebar functions
    function updateSidebarState() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active', isSidebarOpen);
        } else {
            sidebar.classList.add('active');
            isSidebarOpen = true;
        }
    }

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        updateSidebarState();
    }

    // Message handling
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message, getMyanmarTime());
        userInput.value = '';
        
        showLoadingState();
        showTypingIndicator();
        
        getAIResponse(message)
            .then(response => {
                hideTypingIndicator();
                addMessage('ai', response, getMyanmarTime());
                
                if (shouldUseTTS()) {
                    speakResponse(response);
                }
                
                updateChatHistory();
                hideLoadingState();
            })
            .catch(error => {
                hideTypingIndicator();
                handleError(error);
                hideLoadingState();
            });
    }

    function addMessage(sender, text, time) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = parseSimpleMarkdown(text);
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = time;
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timeSpan);
        chatBody.appendChild(messageDiv);
        
        saveMessageToHistory(sender, text, new Date());
        scrollToBottom();
    }

    // Loading states
    function showLoadingState() {
        progressBar.style.width = '30%';
    }

    function hideLoadingState() {
        progressBar.style.width = '100%';
        setTimeout(() => progressBar.style.width = '0%', 500);
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>WAYNE AI စာရိုက်နေသည်...</span>
        `;
        chatBody.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.remove();
    }

    // API Communication
    async function getAIResponse(prompt) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            const response = await fetch(API_CONFIG.endpoint, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify({ 
                    prompt: prompt,
                    language: localStorage.getItem('language') || 'my',
                    chatId: currentChatId
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data?.response) {
                throw new Error('Invalid response format from API');
            }
            
            return data.response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // History management
    function loadChatHistory() {
        const history = JSON.parse(localStorage.getItem('wayneAI_chatHistory')) || {};
        
        historyList.innerHTML = '';
        
        Object.keys(history).sort((a, b) => history[b].lastUpdated - history[a].lastUpdated)
            .forEach(chatId => {
                const chat = history[chatId];
                const historyItem = document.createElement('li');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <i class="fas fa-comment"></i>
                    <span>${chat.preview || 'New Chat'}</span>
                `;
                historyItem.addEventListener('click', () => loadChat(chatId));
                historyList.appendChild(historyItem);
            });
    }

    function saveMessageToHistory(sender, text, timestamp) {
        const history = JSON.parse(localStorage.getItem('wayneAI_chatHistory')) || {};
        
        if (!history[currentChatId]) {
            history[currentChatId] = {
                messages: [],
                preview: text.length > 30 ? text.substring(0, 30) + '...' : text,
                lastUpdated: timestamp.getTime()
            };
        }
        
        history[currentChatId].messages.push({ sender, text, timestamp: timestamp.getTime() });
        history[currentChatId].lastUpdated = timestamp.getTime();
        
        localStorage.setItem('wayneAI_chatHistory', JSON.stringify(history));
    }

    function updateChatHistory() {
        loadChatHistory();
    }

    function loadChat(chatId) {
        currentChatId = chatId;
        const history = JSON.parse(localStorage.getItem('wayneAI_chatHistory')) || {};
        const chat = history[chatId];
        
        chatBody.innerHTML = '';
        
        if (chat && chat.messages) {
            chat.messages.forEach(msg => {
                const time = new Date(msg.timestamp);
                addMessage(msg.sender, msg.text, getMyanmarTime(time));
            });
        }
        
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            localStorage.removeItem('wayneAI_chatHistory');
            currentChatId = generateChatId();
            chatBody.innerHTML = '';
            loadChatHistory();
            sendInitialGreeting();
        }
    }

    function startNewChat() {
        currentChatId = generateChatId();
        chatBody.innerHTML = '';
        sendInitialGreeting();
        
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    }

    // Text-to-speech
    function speakResponse(text) {
        if (!('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getVoiceLanguage();
        utterance.rate = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang === utterance.lang && voice.name.includes('Female'));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }

    function getVoiceLanguage() {
        const lang = localStorage.getItem('language') || 'my';
        return lang === 'en' ? 'en-US' : 'my-MM';
    }

    // Settings management
    function checkSettings() {
        const defaults = {
            language: 'my',
            voiceResponse: 'false',
            theme: 'light'
        };
        
        Object.entries(defaults).forEach(([key, value]) => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, value);
            }
        });
        
        applyTheme();
        updateVoiceToggle();
    }

    function applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function toggleTheme() {
        const newTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme();
    }

    function toggleVoice() {
        const newVoiceState = localStorage.getItem('voiceResponse') === 'true' ? 'false' : 'true';
        localStorage.setItem('voiceResponse', newVoiceState);
        updateVoiceToggle();
    }

    function updateVoiceToggle() {
        const isVoiceOn = localStorage.getItem('voiceResponse') === 'true';
        voiceToggle.innerHTML = isVoiceOn ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
        voiceToggle.title = isVoiceOn ? 'Turn off voice' : 'Turn on voice';
    }

    function shouldUseTTS() {
        return localStorage.getItem('voiceResponse') === 'true' && 
               'speechSynthesis' in window;
    }

    // Helper functions
    function parseSimpleMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleError(error) {
        console.error('Error:', error);
        const errorMessages = {
            my: "တောင်းပန်ပါသည်။ အမှားတစ်ခုဖြစ်ပေါ်နေပါသည်။ နောက်မှပြန်ကြိုးစားပါ။",
            en: "Sorry, an error occurred. Please try again later."
        };
        
        const lang = localStorage.getItem('language') || 'my';
        addMessage('ai', errorMessages[lang], getMyanmarTime());
    }

    function sendInitialGreeting() {
        const greetings = {
            my: "မင်္ဂလာပါ! WAYNE AI မှ ကြိုဆိုပါတယ်။ ကျွန်ုပ်ကို ဘာတွေ မေးမြန်းချင်ပါသလဲ?",
            en: "Hello! Welcome to WAYNE AI. How can I assist you today?"
        };
        
        const lang = localStorage.getItem('language') || 'my';
        setTimeout(() => {
            addMessage('ai', greetings[lang], getMyanmarTime());
        }, 500);
    }

    // Event listeners setup
    function setupEventListeners() {
        // Message sending
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Sidebar controls
        sidebarToggle.addEventListener('click', toggleSidebar);
        newChatBtn.addEventListener('click', startNewChat);
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Settings toggles
        themeToggle.addEventListener('click', toggleTheme);
        voiceToggle.addEventListener('click', toggleVoice);
        
        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                userInput.value = chip.textContent;
                userInput.focus();
            });
        });
        
        // Initialize speech synthesis voices
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                // Voices loaded
            };
        }
        
        // Window resize handler
        window.addEventListener('resize', () => {
            updateSidebarState();
        });
        
        // Focus input on load
        userInput.focus();
    }
});
