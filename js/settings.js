// Settings management

// Get stored settings or set defaults
const defaultSettings = {
    darkMode: false,
    notifications: true,
    currency: 'usd',
    language: 'en',
    billReminders: true,
    virtualKeyboard: true,
    // Include old settings for backwards compatibility
    theme: 'light',
    contrast: 'normal',
    textSize: 'medium'
};

// Initialize settings from local storage
const settings = JSON.parse(localStorage.getItem('settings')) || defaultSettings;

function updateTextSizeButtons() {
    const textSizeButtons = document.querySelectorAll('.size-btn');
    if (textSizeButtons) {
        textSizeButtons.forEach(btn => {
            // Get the text size value from the button text
            const buttonSize = btn.textContent.toLowerCase().trim();
            // Check if this button corresponds to the current setting
            btn.classList.toggle('active', buttonSize === settings.textSize);
        });
    }
}

function updateCurrencyDisplay() {
    const amounts = document.querySelectorAll('.amount, .balance-amount, .summary-value');
    amounts.forEach(amount => {
        const value = parseFloat(amount.textContent.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(value)) {
            amount.textContent = formatCurrency(value, settings.currency);
        }
    });
}

function applySettings() {
    console.log('Applying settings...');
    
    // Apply theme to document and phone frame
    const phoneFrame = document.querySelector('.phone-frame');
    const isDarkMode = settings.darkMode || settings.theme === 'dark';
    
    // Apply dark mode with both class and attribute methods
    document.body.classList.toggle('dark-mode', isDarkMode);
    if (phoneFrame) {
        phoneFrame.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }
    
    // Apply contrast
    const contrast = settings.contrast || 'normal';
    document.documentElement.setAttribute('data-contrast', contrast);
    document.body.classList.toggle('high-contrast', contrast === 'high');
    
    // Apply text size - apply to multiple elements to ensure it takes effect
    const textSize = settings.textSize || 'medium';
    console.log('Applying text size:', textSize);
    
    // Set data attributes
    document.documentElement.setAttribute('data-text-size', textSize);
    document.body.setAttribute('data-text-size', textSize);
    
    if (phoneFrame) {
        phoneFrame.setAttribute('data-text-size', textSize);
    }
    
    // Set all app containers
    document.querySelectorAll('.app-content, .modal, .card').forEach(el => {
        el.setAttribute('data-text-size', textSize);
    });
    
    // Apply text size class to body for CSS targeting
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add(`text-${textSize}`);
    
    updateTextSizeButtons();
    updateCurrencyDisplay();
    
    // Send theme change event for components that need to know
    document.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { 
            darkMode: isDarkMode,
            contrast: contrast,
            textSize: textSize
        }
    }));
    
    // Force a stronger repaint to ensure all CSS changes take effect
    document.body.style.display = 'none';
    document.body.offsetHeight; // This line causes a reflow
    document.body.style.display = '';
    
    // Additional force refresh for deep elements
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 50);
}

async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Please enable notifications to receive updates about your account.');
        }
    }
}

function exportData() {
    const data = {
        transactions: [],
        budget: {},
        goals: {},
        settings: settings
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize UI based on settings
function initializeSettings() {
    // Apply all settings at once
    applySettings();
    
    // Initialize notification toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.checked = settings.notifications;
    }
    
    // Initialize reminders toggle
    const billRemindersToggle = document.getElementById('bill-reminders-toggle');
    if (billRemindersToggle) {
        billRemindersToggle.checked = settings.billReminders;
    }
    
    // Initialize currency select
    const currencySelect = document.querySelector('.currency-select');
    if (currencySelect) {
        currencySelect.value = settings.currency;
    }
    
    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = settings.darkMode || settings.theme === 'dark';
    }
    
    // Initialize contrast toggle
    const contrastToggle = document.getElementById('high-contrast-toggle');
    if (contrastToggle) {
        contrastToggle.checked = settings.contrast === 'high';
    }
    
    // Initialize text size buttons
    updateTextSizeButtons();
    
    // Add virtual keyboard toggle to settings
    addVirtualKeyboardToggle();
    
    // Event listeners for settings changes
    setupSettingsListeners();
}

// Add virtual keyboard toggle to settings
function addVirtualKeyboardToggle() {
    const settingsContainer = document.querySelector('.settings-section:nth-child(1) .settings-card');
    if (!settingsContainer) return;
    
    // Create virtual keyboard setting
    const keyboardSetting = document.createElement('div');
    keyboardSetting.className = 'setting-item';
    keyboardSetting.innerHTML = `
        <div class="setting-label">
            <span class="setting-icon">⌨️</span>
            <div class="setting-info">
                <span class="setting-title">Virtual Keyboard</span>
                <span class="setting-description">Show on-screen keyboard for text inputs</span>
            </div>
        </div>
        <div class="toggle-wrapper">
            <input type="checkbox" id="virtual-keyboard-toggle" ${settings.virtualKeyboard ? 'checked' : ''}>
            <label for="virtual-keyboard-toggle" class="toggle-label"></label>
        </div>
    `;
    
    // Add setting to container
    settingsContainer.appendChild(keyboardSetting);
}

// Set up event listeners for settings
function setupSettingsListeners() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            settings.darkMode = this.checked;
            settings.theme = this.checked ? 'dark' : 'light'; // Keep old setting in sync
            applySettings(); // Apply all settings
            saveSettings();
        });
    }
    
    // Notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function() {
            settings.notifications = this.checked;
            saveSettings();
            
            // Request notification permission if enabled
            if (this.checked && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        });
    }
    
    // Bill reminders toggle
    const billRemindersToggle = document.getElementById('bill-reminders-toggle');
    if (billRemindersToggle) {
        billRemindersToggle.addEventListener('change', function() {
            settings.billReminders = this.checked;
            saveSettings();
        });
    }
    
    // Currency select
    const currencySelect = document.querySelector('.currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            settings.currency = this.value;
            saveSettings();
            updateCurrencyDisplay();
        });
    }
    
    // High Contrast Toggle
    const contrastToggle = document.getElementById('high-contrast-toggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('change', function() {
            settings.contrast = this.checked ? 'high' : 'normal';
            applySettings();
            saveSettings();
        });
    }
    
    // Text Size Buttons
    const textSizeButtons = document.querySelectorAll('.size-btn');
    if (textSizeButtons.length) {
        textSizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const size = this.textContent.toLowerCase().trim();
                console.log(`Text size button clicked: ${size}`);
                settings.textSize = size;
                
                // Deactivate all buttons, then activate the clicked one
                textSizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                applySettings();
                saveSettings();
            });
        });
    }
    
    // Virtual keyboard toggle
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'virtual-keyboard-toggle') {
            settings.virtualKeyboard = e.target.checked;
            saveSettings();
            
            // Dispatch event for keyboard state change
            document.dispatchEvent(new CustomEvent('keyboardSettingChanged', {
                detail: { enabled: settings.virtualKeyboard }
            }));
        }
    });
}

// Save settings to local storage
function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// No export statements - all functions are now globally available 