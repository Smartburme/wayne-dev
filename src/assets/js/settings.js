// settings.js - WAYNE AI Configuration Manager
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings from localStorage or set defaults
    const settings = {
        language: localStorage.getItem('wayneAI_language') || 'my',
        voiceResponse: localStorage.getItem('wayneAI_voiceResponse') === 'true' || false,
        soundEffects: localStorage.getItem('wayneAI_soundEffects') === 'true' || true,
        theme: localStorage.getItem('wayneAI_theme') || 'system',
        saveHistory: localStorage.getItem('wayneAI_saveHistory') === 'true' || true,
        notifications: localStorage.getItem('wayneAI_notifications') === 'true' || false
    };

    // DOM Elements
    const languageSelect = document.getElementById('languageSelect');
    const voiceResponseCheckbox = document.getElementById('voiceResponse');
    const soundEffectsCheckbox = document.getElementById('soundEffects');
    const themeLightBtn = document.getElementById('themeLight');
    const themeDarkBtn = document.getElementById('themeDark');
    const themeSystemBtn = document.getElementById('themeSystem');
    const saveHistoryCheckbox = document.getElementById('saveHistory');
    const notificationsCheckbox = document.getElementById('notifications');
    const backButton = document.querySelector('.back-button');

    // Initialize UI with saved settings
    function initializeSettings() {
        // Language
        languageSelect.value = settings.language;
        
        // Checkboxes
        voiceResponseCheckbox.checked = settings.voiceResponse;
        soundEffectsCheckbox.checked = settings.soundEffects;
        saveHistoryCheckbox.checked = settings.saveHistory;
        notificationsCheckbox.checked = settings.notifications;
        
        // Theme
        updateTheme(settings.theme);
        updateThemeButtonStates(settings.theme);
    }

    // Theme Management
    function updateTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            // System theme - check prefers-color-scheme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.add('light-theme');
            }
        }
    }

    function updateThemeButtonStates(activeTheme) {
        [themeLightBtn, themeDarkBtn, themeSystemBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeTheme === 'light') {
            themeLightBtn.classList.add('active');
        } else if (activeTheme === 'dark') {
            themeDarkBtn.classList.add('active');
        } else {
            themeSystemBtn.classList.add('active');
        }
    }

    // Event Listeners
    languageSelect.addEventListener('change', function() {
        settings.language = this.value;
        localStorage.setItem('wayneAI_language', this.value);
        // You might want to add language change logic here
        console.log('Language changed to:', this.value);
    });

    voiceResponseCheckbox.addEventListener('change', function() {
        settings.voiceResponse = this.checked;
        localStorage.setItem('wayneAI_voiceResponse', this.checked);
        
        if (this.checked) {
            // Initialize voice synthesis if enabled
            initVoiceSynthesis();
        }
    });

    soundEffectsCheckbox.addEventListener('change', function() {
        settings.soundEffects = this.checked;
        localStorage.setItem('wayneAI_soundEffects', this.checked);
    });

    themeLightBtn.addEventListener('click', function() {
        settings.theme = 'light';
        localStorage.setItem('wayneAI_theme', 'light');
        updateTheme('light');
        updateThemeButtonStates('light');
    });

    themeDarkBtn.addEventListener('click', function() {
        settings.theme = 'dark';
        localStorage.setItem('wayneAI_theme', 'dark');
        updateTheme('dark');
        updateThemeButtonStates('dark');
    });

    themeSystemBtn.addEventListener('click', function() {
        settings.theme = 'system';
        localStorage.setItem('wayneAI_theme', 'system');
        updateTheme('system');
        updateThemeButtonStates('system');
    });

    saveHistoryCheckbox.addEventListener('change', function() {
        settings.saveHistory = this.checked;
        localStorage.setItem('wayneAI_saveHistory', this.checked);
        
        if (!this.checked) {
            // Optionally clear existing history
            // localStorage.removeItem('wayneAI_chatHistory');
        }
    });

    notificationsCheckbox.addEventListener('change', function() {
        settings.notifications = this.checked;
        localStorage.setItem('wayneAI_notifications', this.checked);
        
        if (this.checked) {
            // Request notification permission if enabled
            requestNotificationPermission();
        }
    });

    backButton.addEventListener('click', function() {
        window.location.href = 'main.html';
    });

    // Watch for system theme changes
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (e) => {
            if (settings.theme === 'system') {
                updateTheme('system');
            }
        });
    }

    // Helper Functions
    function initVoiceSynthesis() {
        // This would initialize text-to-speech functionality
        console.log('Initializing voice synthesis...');
        // Implementation depends on your TTS solution
    }

    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }
        
        if (Notification.permission === "granted") {
            return;
        }
        
        if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted");
                }
            });
        }
    }

    // Initialize the settings UI
    initializeSettings();
});
