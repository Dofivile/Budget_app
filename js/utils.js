// Utility functions

// Format currency based on selected currency
function formatCurrency(amount, currency = 'usd') {
    const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.toUpperCase()
    });
    return formatter.format(amount);
}

// Show toast notifications
function showToast(message, type = 'info', actionText = null, actionCallback = null) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let html = `<div class="toast-content">${message}</div>`;
    if (actionText) {
        html += `<button class="toast-action">${actionText}</button>`;
    }
    
    toast.innerHTML = html;
    document.body.appendChild(toast);

    if (actionText && actionCallback) {
        const actionBtn = toast.querySelector('.toast-action');
        actionBtn.addEventListener('click', () => {
            actionCallback();
            document.body.removeChild(toast);
        });
    }

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Helper function to calculate next due date for recurring transactions
function calculateNextDueDate(startDate, frequency) {
    const date = new Date(startDate);
    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date.toISOString().split('T')[0];
}

// No export statement - functions are now globally available 