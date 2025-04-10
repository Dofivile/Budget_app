// Settings management

import { formatCurrency, showToast } from './utils.js';

// Initialize settings from localStorage or defaults
const settings = {
    theme: localStorage.getItem('theme') || 'light',
    contrast: localStorage.getItem('contrast') || 'normal',
    textSize: localStorage.getItem('textSize') || 'medium',
    notifications: {
        accountActivity: localStorage.getItem('notifyAccountActivity') === 'true',
        billReminders: localStorage.getItem('notifyBillReminders') === 'true'
    },
    currency: localStorage.getItem('currency') || 'usd'
};

function updateTextSizeButtons() {
    const textSizeButtons = document.querySelectorAll('.size-btn');
    if (textSizeButtons) {
        textSizeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === settings.textSize);
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
    console.log('Theme:', settings.theme);
    
    // Apply theme only to the phone frame
    const phoneFrame = document.querySelector('.phone-frame');
    if (phoneFrame) {
        phoneFrame.setAttribute('data-theme', settings.theme);
        console.log('Phone frame data-theme:', phoneFrame.getAttribute('data-theme'));
    } else {
        console.error('Phone frame not found');
    }
    
    // Apply contrast
    document.documentElement.setAttribute('data-contrast', settings.contrast);
    
    // Apply text size
    document.documentElement.setAttribute('data-text-size', settings.textSize);
    
    updateTextSizeButtons();
    updateCurrencyDisplay();
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

function initializeSettings() {
    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        console.log('Dark mode toggle found');
        console.log('Current theme:', settings.theme);
        darkModeToggle.checked = settings.theme === 'dark';
        
        darkModeToggle.addEventListener('change', function() {
            console.log('Dark mode toggle changed');
            settings.theme = this.checked ? 'dark' : 'light';
            console.log('New theme:', settings.theme);
            localStorage.setItem('theme', settings.theme);
            applySettings();
        });
    } else {
        console.error('Dark mode toggle not found in the DOM');
    }

    // Initialize text size buttons
    const textSizeButtons = document.querySelectorAll('.size-btn');
    if (textSizeButtons) {
        textSizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const size = this.textContent.toLowerCase();
                settings.textSize = size;
                localStorage.setItem('textSize', size);
                updateTextSizeButtons();
                applySettings();
            });
        });
    }

    // High Contrast Toggle
    const contrastToggle = document.getElementById('high-contrast-toggle');
    if (contrastToggle) {
        contrastToggle.checked = settings.contrast === 'high';
        contrastToggle.addEventListener('change', function() {
            settings.contrast = this.checked ? 'high' : 'normal';
            localStorage.setItem('contrast', settings.contrast);
            applySettings();
        });
    }

    // Notification Toggles
    const accountActivityToggle = document.getElementById('account-activity-toggle');
    if (accountActivityToggle) {
        accountActivityToggle.checked = settings.notifications.accountActivity;
        accountActivityToggle.addEventListener('change', function() {
            settings.notifications.accountActivity = this.checked;
            localStorage.setItem('notifyAccountActivity', this.checked);
            if (this.checked) {
                requestNotificationPermission();
            }
        });
    }

    const billRemindersToggle = document.getElementById('bill-reminders-toggle');
    if (billRemindersToggle) {
        billRemindersToggle.checked = settings.notifications.billReminders;
        billRemindersToggle.addEventListener('change', function() {
            settings.notifications.billReminders = this.checked;
            localStorage.setItem('notifyBillReminders', this.checked);
            if (this.checked) {
                requestNotificationPermission();
            }
        });
    }

    // Currency Selector
    const currencySelect = document.querySelector('.currency-select');
    if (currencySelect) {
        currencySelect.value = settings.currency;
        currencySelect.addEventListener('change', function() {
            settings.currency = this.value;
            localStorage.setItem('currency', this.value);
            updateCurrencyDisplay();
        });
    }

    // Export Data
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Apply initial settings
    applySettings();

    // Initialize notification permission check
    if (settings.notifications.accountActivity || settings.notifications.billReminders) {
        requestNotificationPermission();
    }
}

export { settings, applySettings, requestNotificationPermission, initializeSettings, updateCurrencyDisplay }; 