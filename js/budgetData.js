// Budget Data Manager for transactions

const BudgetDataManager = {
    data: {
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        categories: {
            food: { budget: 300, spent: 0 },
            transport: { budget: 150, spent: 0 },
            utilities: { budget: 200, spent: 0 },
            entertainment: { budget: 100, spent: 0 },
            shopping: { budget: 200, spent: 0 }
        }
    },
    
    addTransaction(transaction) {
        this.data.transactions.unshift(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.data.transactions));
        
        // Update category spending if it's an expense
        if (transaction.type === 'expense' && this.data.categories[transaction.category]) {
            this.data.categories[transaction.category].spent += transaction.amount;
        }
        
        this.updateUI();
    },
    
    updateUI() {
        // Update recent activity
        this.updateRecentActivity();
        // Update budget progress
        this.updateBudgetProgress();
    },
    
    updateRecentActivity() {
        const recentActivityList = document.querySelector('.activity-list');
        if (!recentActivityList) return;
        
        const recent = this.data.transactions.slice(0, 5).map(t => `
            <div class="activity-item">
                <div class="activity-amount">${formatCurrency(t.amount)}</div>
                <div class="activity-details">
                    <div class="activity-name">${t.name}</div>
                    <div class="activity-category">${t.category}</div>
                </div>
                <div class="activity-time">${t.time}</div>
            </div>
        `).join('');
        
        recentActivityList.innerHTML = recent;
        
        // Add recurring indicator if transaction is recurring
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            const transaction = this.data.transactions.find(
                t => t.name === item.querySelector('.activity-name').textContent
            );
            if (transaction?.isRecurring) {
                item.querySelector('.activity-name').innerHTML += `
                    <span class="recurring-indicator" title="Recurring Transaction">🔄</span>
                `;
            }
        });
    },
    
    updateBudgetProgress() {
        Object.entries(this.data.categories).forEach(([category, data]) => {
            const percentage = (data.spent / data.budget) * 100;
            const progressBar = document.querySelector(`[data-category="${category}"] .progress-bar`);
            if (progressBar) {
                progressBar.style.width = `${Math.min(percentage, 100)}%`;
            }
        });
    },
    
    getTransactionsForecast(months = 3) {
        const forecast = [];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);
        
        const recurring = JSON.parse(localStorage.getItem('recurring') || '[]');
        recurring.forEach(recurring => {
            let currentDate = new Date(recurring.nextDueDate);
            
            while (currentDate <= endDate) {
                if (recurring.endDate && new Date(recurring.endDate) < currentDate) {
                    break;
                }
                
                forecast.push({
                    ...recurring,
                    date: currentDate.toISOString().split('T')[0],
                    isForecast: true
                });
                
                currentDate = new Date(calculateNextDueDate(
                    currentDate.toISOString().split('T')[0],
                    recurring.frequency
                ));
            }
        });
        
        return forecast;
    }
}; 