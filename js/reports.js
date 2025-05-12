const ReportsManager = {
    data: {
        income: {
            weeklyData: [
                { day: 'Monday', date: '2024-03-18', earnings: [
                    { source: 'Salary', amount: 250 },
                    { source: 'Freelance', amount: 100 }
                ], total: 350 },
                { day: 'Tuesday', date: '2024-03-19', earnings: [
                    { source: 'Salary', amount: 250 },
                    { source: 'Side Project', amount: 75 }
                ], total: 325 },
                { day: 'Wednesday', date: '2024-03-20', earnings: [
                    { source: 'Salary', amount: 250 },
                    { source: 'Investments', amount: 150 }
                ], total: 400 },
                { day: 'Thursday', date: '2024-03-21', earnings: [
                    { source: 'Salary', amount: 250 }
                ], total: 250 },
                { day: 'Friday', date: '2024-03-22', earnings: [
                    { source: 'Salary', amount: 250 },
                    { source: 'Freelance', amount: 200 }
                ], total: 450 }
            ],
            monthlyData: [
                { week: 'Week 1', earnings: [
                    { source: 'Salary', amount: 1000 },
                    { source: 'Freelance', amount: 400 }
                ], total: 1400 },
                { week: 'Week 2', earnings: [
                    { source: 'Salary', amount: 1000 },
                    { source: 'Side Project', amount: 300 }
                ], total: 1300 },
                { week: 'Week 3', earnings: [
                    { source: 'Salary', amount: 1000 },
                    { source: 'Investments', amount: 600 }
                ], total: 1600 },
                { week: 'Week 4', earnings: [
                    { source: 'Salary', amount: 1000 },
                    { source: 'Freelance', amount: 500 }
                ], total: 1500 }
            ]
        },
        spending: {
            weeklyData: [
                { category: 'Dining', amount: 320, budget: 400, percentage: 78 },
                { category: 'Rent', amount: 800, budget: 800, percentage: 100 },
                { category: 'Entertainment', amount: 150, budget: 300, percentage: 45 },
                { category: 'Groceries', amount: 250, budget: 400, percentage: 60 }
            ],
            monthlyData: [
                { category: 'Dining', amount: 1280, budget: 1600, percentage: 80 },
                { category: 'Rent', amount: 3200, budget: 3200, percentage: 100 },
                { category: 'Entertainment', amount: 600, budget: 1200, percentage: 50 },
                { category: 'Groceries', amount: 1000, budget: 1600, percentage: 62.5 }
            ]
        },
        goals: {
            active: [
                {
                    name: 'Security Deposit',
                    type: 'Housing',
                    currentAmount: 850,
                    targetAmount: 1200,
                    percentage: 71,
                    isSuccess: true
                },
                {
                    name: 'Used iPad',
                    type: 'Study Tools',
                    currentAmount: 280,
                    targetAmount: 400,
                    percentage: 70,
                    isSuccess: true
                },
                {
                    name: 'Spring Break Trip',
                    type: 'Travel',
                    currentAmount: 320,
                    targetAmount: 600,
                    percentage: 53,
                    isSuccess: true
                },
                {
                    name: 'Emergency Fund',
                    type: 'Safety Net',
                    currentAmount: 450,
                    targetAmount: 1000,
                    percentage: 45,
                    isSuccess: true
                }
            ],
            completed: [
                {
                    name: 'Textbooks',
                    type: 'Education',
                    currentAmount: 300,
                    targetAmount: 300,
                    percentage: 100,
                    completionDate: '2024-02-15',
                    isSuccess: true
                },
                {
                    name: 'Concert Tickets',
                    type: 'Entertainment',
                    currentAmount: 150,
                    targetAmount: 150,
                    percentage: 100,
                    completionDate: '2024-01-20',
                    isSuccess: true
                },
                {
                    name: 'Winter Coat',
                    type: 'Essential',
                    currentAmount: 120,
                    targetAmount: 120,
                    percentage: 100,
                    completionDate: '2023-12-10',
                    isSuccess: true
                },
                {
                    name: 'Study Desk',
                    type: 'Furniture',
                    currentAmount: 180,
                    targetAmount: 180,
                    percentage: 100,
                    completionDate: '2023-11-25',
                    isSuccess: true
                }
            ]
        },
        currentView: {
            income: 'week',
            spending: 'week',
            goals: 'active'
        }
    },

    init() {
        console.log('ReportsManager.init() called');
        this.setupEventListeners();
        this.renderCurrentViews();
        this.setupDateRangeFilter();
    },

    setupEventListeners() {
        console.log('Setting up reports event listeners');
        
        // View toggle buttons for all sections
        const toggleContainers = document.querySelectorAll('.view-toggle');
        toggleContainers.forEach(container => {
            const reportPage = container.closest('.report-page');
            const section = reportPage.id.split('-')[0]; // 'income', 'spending', or 'goals'
            const toggleBtns = container.querySelectorAll('.toggle-btn');
            
            toggleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (section === 'goals') {
                        const view = btn.textContent.toLowerCase().includes('completed') ? 'completed' : 'active';
                        this.switchView(section, view);
                    } else {
                        const view = btn.textContent.toLowerCase().includes('month') ? 'month' : 'week';
                        this.switchView(section, view);
                    }
                });
            });
        });
    },

    switchView(section, view) {
        console.log('Switching', section, 'to view:', view);
        this.data.currentView[section] = view;
        
        // Update toggle buttons for the specific section
        const toggleBtns = document.querySelector(`#${section}-page .view-toggle`).querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            if (section === 'goals') {
                const isCompleted = btn.textContent.toLowerCase().includes('completed');
                btn.classList.toggle('active', (isCompleted && view === 'completed') || (!isCompleted && view === 'active'));
            } else {
                const isMonth = btn.textContent.toLowerCase().includes('month');
                btn.classList.toggle('active', (isMonth && view === 'month') || (!isMonth && view === 'week'));
            }
        });

        this.renderSection(section);
    },

    renderCurrentViews() {
        this.renderSection('income');
        this.renderSection('spending');
        this.renderSection('goals');
    },

    renderSection(section) {
        if (section === 'income') {
            this.renderIncomeView();
        } else if (section === 'spending') {
            this.renderSpendingView();
        } else if (section === 'goals') {
            this.renderGoalsView();
        }
    },

    renderIncomeView() {
        const container = document.querySelector('#income-page .earnings-breakdown');
        if (!container) return;

        const isMonthView = container.closest('.report-page')
            .querySelector('.view-toggle .toggle-btn.active')
            .textContent.toLowerCase().includes('month');

        const data = isMonthView ? this.data.income.monthlyData : this.data.income.weeklyData;
        
        container.innerHTML = data.map(item => `
            <div class="earnings-row">
                <div class="day-info">
                    <div class="day">${isMonthView ? item.week : item.day}</div>
                    ${!isMonthView ? `<div class="date">${item.date}</div>` : ''}
                </div>
                <div class="earnings-details">
                    ${item.earnings.map(earning => `
                        <div class="earning-item">
                            <span class="source">${earning.source}</span>
                            <span class="amount">$${earning.amount}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="daily-total">$${item.total}</div>
            </div>
        `).join('');
    },

    renderSpendingView() {
        const container = document.querySelector('#spending-page .category-breakdown');
        if (!container) return;

        const isMonthView = container.closest('.report-page')
            .querySelector('.view-toggle .toggle-btn.active')
            .textContent.toLowerCase().includes('month');

        const data = isMonthView ? this.data.spending.monthlyData : this.data.spending.weeklyData;
        
        container.innerHTML = data.map(item => `
            <div class="category-row">
                <div class="category-name">${item.category}</div>
                <div class="category-bar">
                    <div class="progress-bar ${item.percentage > 75 ? 'warning' : ''}" 
                         style="width: ${item.percentage}%"></div>
                    <span class="usage-text ${item.percentage > 75 ? 'warning-text' : ''}">
                        ${item.percentage}% used
                    </span>
                </div>
                <div class="category-amount">$${item.amount}</div>
                <div class="category-percent">${Math.round(item.amount / item.budget * 100)}%</div>
            </div>
        `).join('');
    },

    renderGoalsView() {
        const container = document.querySelector('#goals-page .savings-goal-container');
        if (!container) return;

        const isCompleted = container.closest('.report-page')
            .querySelector('.view-toggle .toggle-btn.active')
            .textContent.toLowerCase().includes('completed');

        const goals = isCompleted ? this.data.goals.completed : this.data.goals.active;
        
        container.innerHTML = goals.map(goal => `
            <div class="savings-header">
                <h4>${goal.name}</h4>
                <span class="goal-name">${goal.type}</span>
                ${isCompleted ? `<span class="completion-date">Completed on ${goal.completionDate}</span>` : ''}
            </div>
            <div class="goal-progress">
                <div class="progress-bar-large">
                    <div class="progress-fill ${goal.isSuccess ? 'success' : ''}" 
                         style="width: ${goal.percentage}%"></div>
                </div>
                <div class="goal-stats">
                    <div class="goal-amount">
                        <span class="current">$${goal.currentAmount}</span>
                        <span class="separator">/</span>
                        <span class="target">$${goal.targetAmount}</span>
                    </div>
                    <span class="goal-percent">${goal.percentage}% to target</span>
                </div>
            </div>
        `).join('');
    },

    setupDateRangeFilter() {
        // Get the filter dropdown element
        const reportFilter = document.getElementById('report-filter');
        
        // Add event listener for changes
        reportFilter.addEventListener('change', (e) => {
            const selectedRange = e.target.value;
            this.updateDataByTimeRange(selectedRange);
        });
    },
    
    updateDataByTimeRange(timeRange) {
        // Sample data for different time ranges
        const timeRangeData = {
            'week': {
                incomeData: [
                    { day: 'Monday', date: 'Apr 15', earnings: [{ source: 'Tutoring', amount: 45 }, { source: 'Freelance', amount: 85 }] },
                    { day: 'Tuesday', date: 'Apr 16', earnings: [{ source: 'Tutoring', amount: 60 }] },
                    { day: 'Wednesday', date: 'Apr 17', earnings: [{ source: 'Freelance', amount: 125 }] }
                ],
                spendingData: {
                    dining: { used: 78, amount: 320, percent: 32 },
                    rent: { used: 100, amount: 800, percent: 40 },
                    entertainment: { used: 45, amount: 150, percent: 15 },
                    groceries: { used: 60, amount: 250, percent: 25 }
                },
                goalsData: [
                    { name: 'Security Deposit', category: 'Housing', current: 850, target: 1200, percent: 71 },
                    { name: 'Used iPad', category: 'Study Tools', current: 280, target: 400, percent: 70 },
                    { name: 'Spring Break Trip', category: 'Travel', current: 320, target: 600, percent: 53 }
                ]
            },
            'last-week': {
                incomeData: [
                    { day: 'Monday', date: 'Apr 8', earnings: [{ source: 'Tutoring', amount: 30 }, { source: 'Freelance', amount: 65 }] },
                    { day: 'Tuesday', date: 'Apr 9', earnings: [{ source: 'Tutoring', amount: 40 }] },
                    { day: 'Friday', date: 'Apr 12', earnings: [{ source: 'Part-time job', amount: 150 }] }
                ],
                spendingData: {
                    dining: { used: 65, amount: 290, percent: 30 },
                    rent: { used: 100, amount: 800, percent: 45 },
                    entertainment: { used: 35, amount: 120, percent: 12 },
                    groceries: { used: 50, amount: 220, percent: 22 }
                },
                goalsData: [
                    { name: 'Security Deposit', category: 'Housing', current: 810, target: 1200, percent: 68 },
                    { name: 'Used iPad', category: 'Study Tools', current: 250, target: 400, percent: 63 },
                    { name: 'Spring Break Trip', category: 'Travel', current: 280, target: 600, percent: 47 }
                ]
            },
            'month': {
                incomeData: [
                    { day: 'Week 1', date: 'Apr 1-7', earnings: [{ source: 'Tutoring', amount: 120 }, { source: 'Freelance', amount: 180 }] },
                    { day: 'Week 2', date: 'Apr 8-14', earnings: [{ source: 'Tutoring', amount: 90 }, { source: 'Part-time job', amount: 220 }] },
                    { day: 'Week 3', date: 'Apr 15-21', earnings: [{ source: 'Freelance', amount: 310 }] }
                ],
                spendingData: {
                    dining: { used: 85, amount: 350, percent: 28 },
                    rent: { used: 100, amount: 800, percent: 35 },
                    entertainment: { used: 70, amount: 200, percent: 18 },
                    groceries: { used: 80, amount: 300, percent: 24 }
                },
                goalsData: [
                    { name: 'Security Deposit', category: 'Housing', current: 850, target: 1200, percent: 71 },
                    { name: 'Used iPad', category: 'Study Tools', current: 280, target: 400, percent: 70 },
                    { name: 'Spring Break Trip', category: 'Travel', current: 320, target: 600, percent: 53 }
                ]
            },
            'custom': {
                // This would normally be populated when the user selects a custom date range
                incomeData: [], 
                spendingData: {},
                goalsData: []
            }
        };
        
        // Apply consistent height constraints to maintain spacing
        this.applyConsistentSpacing();
        
        // Get data for the selected time range
        const data = timeRangeData[timeRange];
        
        // Update the UI with the new data
        if (data) {
            this.updateIncomeView(data.incomeData);
            this.updateSpendingView(data.spendingData);
            this.updateGoalsView(data.goalsData);
        }
        
        // If custom range, show date picker dialog
        if (timeRange === 'custom') {
            this.showCustomDateRangePicker();
        }
    },
    
    updateIncomeView(incomeData) {
        const container = document.querySelector('.earnings-breakdown');
        if (!container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Add each income row
        incomeData.forEach(day => {
            const row = document.createElement('div');
            row.className = 'earnings-row';
            
            let earningItems = '';
            let dailyTotal = 0;
            
            day.earnings.forEach(earning => {
                earningItems += `
                    <div class="earning-item">
                        <span class="source">${earning.source}</span>
                        <span class="amount">$${earning.amount}</span>
                    </div>
                `;
                dailyTotal += earning.amount;
            });
            
            row.innerHTML = `
                <div class="day-info">
                    <div class="day">${day.day}</div>
                    <div class="date">${day.date}</div>
                </div>
                <div class="earnings-details">
                    ${earningItems}
                </div>
                <div class="daily-total">$${dailyTotal}</div>
            `;
            
            container.appendChild(row);
        });
    },
    
    updateSpendingView(spendingData) {
        const container = document.querySelector('.category-breakdown');
        if (!container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Add each category row
        Object.entries(spendingData).forEach(([category, data]) => {
            const categoryNameFormatted = category.charAt(0).toUpperCase() + category.slice(1);
            
            const row = document.createElement('div');
            row.className = 'category-row';
            
            // Set warning class if over 75% used
            const warningClass = data.used > 75 ? 'warning' : 'success';
            
            row.innerHTML = `
                <div class="category-name">${categoryNameFormatted}</div>
                <div class="category-bar">
                    <div class="progress-bar ${warningClass}" style="width: ${data.used}%"></div>
                    <span class="usage-text ${data.used > 75 ? 'warning-text' : ''}">${data.used}% used</span>
                </div>
                <div class="category-amount">$${data.amount}</div>
                <div class="category-percent">${data.percent}%</div>
            `;
            
            container.appendChild(row);
        });
    },
    
    updateGoalsView(goalsData) {
        const container = document.querySelector('.savings-goal-container');
        if (!container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Add each goal
        goalsData.forEach(goal => {
            const goalElement = document.createElement('div');
            goalElement.className = 'savings-goal';
            
            goalElement.innerHTML = `
                <div class="savings-header">
                    <h4>${goal.name}</h4>
                    <div class="goal-name">${goal.category}</div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar-large">
                        <div class="progress-fill" style="width: ${goal.percent}%"></div>
                    </div>
                    <div class="goal-stats">
                        <div class="goal-amount">
                            <span class="current">$${goal.current}</span>
                            <span class="separator">/</span>
                            <span class="target">$${goal.target}</span>
                        </div>
                        <div class="goal-percent">${goal.percent}% to target</div>
                    </div>
                </div>
            `;
            
            container.appendChild(goalElement);
        });
    },
    
    showCustomDateRangePicker() {
        // This would show a custom date picker dialog
        console.log('Show custom date range picker');
        // For demo purposes, we could add a simple alert
        setTimeout(() => {
            alert('Please select your custom date range');
            // After user selects dates, we would fetch and display the data
        }, 500);
    },

    // Add new method to ensure consistent spacing between views
    applyConsistentSpacing() {
        // Find all containers and set fixed heights
        const containers = [
            '.earnings-breakdown',
            '.category-breakdown',
            '.savings-goal-container'
        ];
        
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                // Set a minimum height to prevent layout shifts
                container.style.minHeight = selector === '.savings-goal-container' ? '180px' : '150px';
                // Set overflow to auto to handle varying content sizes
                container.style.overflow = 'auto';
                // Ensure consistent top margins
                container.style.marginTop = '8px';
            }
        });
        
        // Ensure consistent spacing between section headers
        const sectionHeaders = document.querySelectorAll('.report-page h3');
        sectionHeaders.forEach(header => {
            header.style.marginBottom = '8px';
            header.style.marginTop = '12px';
        });
    }
};

// Initialize reports manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    ReportsManager.init();
}); 