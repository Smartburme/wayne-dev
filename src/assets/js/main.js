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
