document.addEventListener('DOMContentLoaded', function() {
    // Get all nav items and tab contents
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Get UI elements first
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const textSizeButtons = document.querySelectorAll('.size-btn');
    const accountActivityToggle = document.getElementById('account-activity-toggle');
    const billRemindersToggle = document.getElementById('bill-reminders-toggle');
    const currencySelect = document.querySelector('.currency-select');
    const exportBtn = document.querySelector('.export-btn');

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

    console.log('Initial settings:', settings);

    // Helper Functions
    function formatCurrency(amount, currency) {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency.toUpperCase()
        });
        return formatter.format(amount);
    }

    function updateTextSizeButtons() {
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
        
        if (textSizeButtons) {
            updateTextSizeButtons();
        }
        updateCurrencyDisplay();
    }

    // Initialize dark mode toggle
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

    // Apply initial settings
    applySettings();

    // Add click event listener to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');

            // Get the tab id from nav text
            const tabText = this.querySelector('.nav-text').textContent.toLowerCase();
            const tabId = tabText.replace(/\s+/g, '-') + '-tab';
            
            // Hide all tab contents
            tabContents.forEach(tab => tab.style.display = 'none');
            
            // Show the selected tab content
            document.getElementById(tabId).style.display = 'block';
        });
    });

    // Reports page navigation
    const reportPages = document.querySelectorAll('.report-page');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentPageIndex = 0;

    function showReportPage(index) {
        // Ensure index is within bounds
        if (index < 0 || index >= reportPages.length) return;

        reportPages.forEach(page => page.classList.remove('active'));
        navDots.forEach(dot => dot.classList.remove('active'));
        
        reportPages[index].classList.add('active');
        navDots[index].classList.add('active');
        
        currentPageIndex = index;
    }

    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => showReportPage(index));
    });

    // Add click handlers for navigation buttons in each report page
    document.querySelectorAll('.reports-navigation-buttons').forEach(nav => {
        const buttons = nav.querySelectorAll('.nav-btn');
        
        // Back button
        buttons[0].addEventListener('click', () => {
            if (currentPageIndex > 0) {
                showReportPage(currentPageIndex - 1);
            }
        });

        // Next button
        buttons[1].addEventListener('click', () => {
            if (currentPageIndex < reportPages.length - 1) {
                showReportPage(currentPageIndex + 1);
            }
        });
    });

    // Initialize reports page
    showReportPage(0);

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
    if (currencySelect) {
        currencySelect.value = settings.currency;
        currencySelect.addEventListener('change', function() {
            settings.currency = this.value;
            localStorage.setItem('currency', this.value);
            updateCurrencyDisplay();
        });
    }

    // Export Data
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
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

    // Initialize notification permission check
    if (settings.notifications.accountActivity || settings.notifications.billReminders) {
        requestNotificationPermission();
    }

    // Transaction Management
    function navigate(screen) {
        const forms = document.querySelectorAll('.transaction-form');
        forms.forEach(form => form.classList.add('hidden'));

        switch(screen) {
            case 'add-transaction':
                document.getElementById('add-transaction-form').classList.remove('hidden');
                break;
            case 'recurring-transaction':
                document.getElementById('recurring-transaction-form').classList.remove('hidden');
                break;
            case 'bills':
                document.getElementById('bills-management').classList.remove('hidden');
                break;
        }
    }

    function hideTransactionForm(formId) {
        document.getElementById(formId).classList.add('hidden');
    }

    function markBillPaid(billName) {
        // In a real app, this would update the database
        const button = event.target;
        const billItem = button.closest('.bill-item');
        billItem.style.opacity = '0.5';
        button.textContent = 'Paid';
        button.disabled = true;
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Bill Paid', {
                body: `${billName} bill has been marked as paid.`,
                icon: '/path/to/icon.png'
            });
        }
    }

    // Add event listeners for transaction forms
    const transactionForms = document.querySelectorAll('.expense-form');
    transactionForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, this would save to a database
            const formData = new FormData(form);
            console.log('Transaction saved:', Object.fromEntries(formData));
            
            // Show success message
            alert('Transaction saved successfully!');
            
            // Reset form and hide it
            form.reset();
            form.closest('.transaction-form').classList.add('hidden');
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Transaction Saved', {
                    body: 'Your transaction has been recorded successfully.',
                    icon: '/path/to/icon.png'
                });
            }
        });
    });

    // Set default date to today for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.valueAsDate = new Date();
    });

    // Screen Navigation
    function showBudgetScreen(screenId) {
        const screens = document.querySelectorAll('.manage-budget-screen');
        screens.forEach(screen => screen.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // Event delegation for screen navigation
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen) {
            event.preventDefault();
            showBudgetScreen(button.dataset.screen);
        }

        // Handle back buttons
        if (event.target.closest('.back-btn')) {
            event.preventDefault();
            showBudgetScreen('manage-budget-main');
        }
    });

    // Form Handling
    function handleTransactionSubmit(event, isRecurring = false) {
        event.preventDefault();
        const form = event.target;
        
        // Get form data
        const type = form.querySelector('input[name="transaction-type"]:checked').value;
        const name = form.querySelector('input[name="transaction-name"]').value;
        const amount = parseFloat(form.querySelector('input[name="amount"]').value);
        const category = form.querySelector('select[name="category"]').value;
        const date = form.querySelector('input[name="date"]').value;
        const notes = form.querySelector('textarea[name="notes"]').value;
        
        // Additional data for recurring transactions
        const frequency = isRecurring ? form.querySelector('select[name="frequency"]').value : null;
        
        // Validate form data
        if (!name || !amount || !category || !date) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Create transaction object
        const transaction = {
            type,
            name,
            amount,
            category,
            date,
            notes,
            ...(isRecurring && { frequency }),
            timestamp: new Date().toISOString()
        };
        
        // Save transaction
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Show success message
        showToast(`${isRecurring ? 'Recurring transaction' : 'Transaction'} added successfully`);
        
        // Reset form and go back to main screen
        form.reset();
        showBudgetScreen('manage-budget-main');

        // If it's a recurring transaction, add it to localStorage
        if (transaction.isRecurring) {
            const recurring = JSON.parse(localStorage.getItem('recurring') || '[]');
            recurring.push({
                ...transaction,
                startDate: transaction.date,
                endDate: transaction.recurringEndDate,
                nextDueDate: calculateNextDueDate(transaction.date, transaction.frequency)
            });
            localStorage.setItem('recurring', JSON.stringify(recurring));
            showToast('Recurring transaction saved!', 'success');
        }
    }

    // Bills Management
    const BillsManager = {
        data: {
            bills: JSON.parse(localStorage.getItem('bills') || '[]')
        },

        init() {
            // Add sample data if no bills exist
            if (this.data.bills.length === 0) {
                this.initializeSampleBills();
            }
            this.setupEventListeners();
            this.loadBills();
        },

        initializeSampleBills() {
            const today = new Date();
            const sampleBills = [
                {
                    id: 'bill1',
                    name: 'Electricity Bill',
                    amount: 85.50,
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
                    category: 'Utilities',
                    paid: false
                },
                {
                    id: 'bill2',
                    name: 'Internet Service',
                    amount: 75.00,
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
                    category: 'Utilities',
                    paid: false
                },
                {
                    id: 'bill3',
                    name: 'Netflix Subscription',
                    amount: 14.99,
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString(),
                    category: 'Subscriptions',
                    paid: false
                },
                {
                    id: 'bill4',
                    name: 'Rent',
                    amount: 1200.00,
                    dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString(),
                    category: 'Rent',
                    paid: false
                },
                {
                    id: 'bill5',
                    name: 'Car Insurance',
                    amount: 95.00,
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString(),
                    category: 'Insurance',
                    paid: false
                }
            ];

            this.data.bills = sampleBills;
            localStorage.setItem('bills', JSON.stringify(sampleBills));
        },

        setupEventListeners() {
            // Search functionality
            const searchInput = document.querySelector('.bills-search input');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    this.filterBills();
                });
            }

            // Filter functionality
            const filterSelects = document.querySelectorAll('.bills-filters-row select');
            filterSelects.forEach(select => {
                select.addEventListener('change', () => {
                    this.filterBills();
                });
            });

            // Bill actions
            document.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.bill-action-btn');
                if (!actionBtn) return;

                const billItem = actionBtn.closest('.bill-item');
                const billId = billItem.dataset.billId;
                const action = actionBtn.textContent.trim();

                switch (action) {
                    case 'Mark as Paid':
                        this.markBillAsPaid(billId);
                        break;
                    case 'Edit':
                        this.editBill(billId);
                        break;
                    case 'Delete':
                        this.deleteBill(billId);
                        break;
                }
            });
        },

        loadBills() {
            const billsList = document.getElementById('upcoming-bills');
            const billsEmpty = document.querySelector('.bills-empty');
            
            if (!this.data.bills.length) {
                if (billsList) billsList.style.display = 'none';
                if (billsEmpty) billsEmpty.style.display = 'flex';
                return;
            }

            if (billsList) billsList.style.display = 'flex';
            if (billsEmpty) billsEmpty.style.display = 'none';

            this.renderBills(this.data.bills);
        },

        renderBills(bills) {
            const billsList = document.getElementById('upcoming-bills');
            if (!billsList) return;

            billsList.innerHTML = bills.map(bill => this.createBillHTML(bill)).join('');
        },

        createBillHTML(bill) {
            const dueDate = new Date(bill.dueDate);
            const today = new Date();
            const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let statusClass = 'upcoming';
            let statusText = `Due in ${diffDays} days`;
            
            if (bill.paid) {
                statusClass = 'paid';
                statusText = 'Paid';
            } else if (diffDays < 0) {
                statusClass = 'overdue';
                statusText = `${Math.abs(diffDays)} days overdue`;
            }

            return `
                <div class="bill-item" data-bill-id="${bill.id}">
                    <div class="bill-header">
                        <div class="bill-title">
                            <span class="bill-name">${bill.name}</span>
                            <span class="bill-amount">${formatCurrency(bill.amount)}</span>
                        </div>
                        <span class="bill-status ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="bill-details">
                        <div class="bill-detail-item">
                            <svg viewBox="0 0 24 24">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                            </svg>
                            <span>Due: ${new Date(bill.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div class="bill-detail-item">
                            <svg viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                            </svg>
                            <span>Category: ${bill.category}</span>
                        </div>
                    </div>
                    
                    <div class="bill-actions">
                        ${!bill.paid ? `
                            <button class="bill-action-btn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                Mark as Paid
                            </button>
                        ` : ''}
                        <button class="bill-action-btn">
                            <svg viewBox="0 0 24 24">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="bill-action-btn">
                            <svg viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        },

        filterBills() {
            const searchTerm = document.querySelector('.bills-search input')?.value.toLowerCase() || '';
            const statusFilter = document.querySelector('select[aria-label="Status"]')?.value || 'all';
            const dateFilter = document.querySelector('select[aria-label="Due Date"]')?.value || 'all';
            const categoryFilter = document.querySelector('select[aria-label="Category"]')?.value || 'all';

            let filteredBills = this.data.bills.filter(bill => {
                const matchesSearch = bill.name.toLowerCase().includes(searchTerm) ||
                                    bill.category.toLowerCase().includes(searchTerm);
                
                const matchesStatus = statusFilter === 'all' || 
                                    (statusFilter === 'paid' && bill.paid) ||
                                    (statusFilter === 'upcoming' && !bill.paid && new Date(bill.dueDate) >= new Date()) ||
                                    (statusFilter === 'overdue' && !bill.paid && new Date(bill.dueDate) < new Date());

                const matchesCategory = categoryFilter === 'all' || bill.category.toLowerCase() === categoryFilter;

                const dueDate = new Date(bill.dueDate);
                const today = new Date();
                let matchesDate = true;

                if (dateFilter !== 'all') {
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const nextWeekStart = new Date(weekEnd);
                    nextWeekStart.setDate(weekEnd.getDate() + 1);
                    const nextWeekEnd = new Date(nextWeekStart);
                    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

                    switch (dateFilter) {
                        case 'this-week':
                            matchesDate = dueDate >= weekStart && dueDate <= weekEnd;
                            break;
                        case 'next-week':
                            matchesDate = dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
                            break;
                        case 'this-month':
                            matchesDate = dueDate >= monthStart && dueDate <= monthEnd;
                            break;
                        case 'next-month':
                            matchesDate = dueDate >= nextMonthStart && dueDate <= nextMonthEnd;
                            break;
                    }
                }

                return matchesSearch && matchesStatus && matchesCategory && matchesDate;
            });

            this.renderBills(filteredBills);
        },

        markBillAsPaid(billId) {
            const billIndex = this.data.bills.findIndex(b => b.id === billId);
            if (billIndex === -1) return;

            this.data.bills[billIndex].paid = true;
            localStorage.setItem('bills', JSON.stringify(this.data.bills));
            
            showToast(
                'Bill marked as paid',
                'success',
                'Undo',
                () => {
                    this.data.bills[billIndex].paid = false;
                    localStorage.setItem('bills', JSON.stringify(this.data.bills));
                    this.loadBills();
                    showToast('Payment status reverted');
                }
            );

            this.loadBills();

            // Show notification if enabled
            if (settings.notifications.billReminders && Notification.permission === 'granted') {
                new Notification('Bill Paid', {
                    body: `${this.data.bills[billIndex].name} has been marked as paid.`,
                    icon: '/path/to/icon.png'
                });
            }
        },

        editBill(billId) {
            const bill = this.data.bills.find(b => b.id === billId);
            if (!bill) return;

            // TODO: Implement edit bill form
            console.log('Edit bill:', bill);
        },

        deleteBill(billId) {
            const billIndex = this.data.bills.findIndex(b => b.id === billId);
            if (billIndex === -1) return;

            const deletedBill = this.data.bills[billIndex];
            this.data.bills.splice(billIndex, 1);
            localStorage.setItem('bills', JSON.stringify(this.data.bills));

            showToast(
                'Bill deleted',
                'success',
                'Undo',
                () => {
                    this.data.bills.splice(billIndex, 0, deletedBill);
                    localStorage.setItem('bills', JSON.stringify(this.data.bills));
                    this.loadBills();
                    showToast('Bill restored');
                }
            );

            this.loadBills();
        }
    };

    // Initialize Bills Manager when the bills screen is shown
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen === 'bills-screen') {
            BillsManager.init();
        }
    });

    // Budget Data Manager
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
        },
        
        updateBudgetProgress() {
            Object.entries(this.data.categories).forEach(([category, data]) => {
                const percentage = (data.spent / data.budget) * 100;
                const progressBar = document.querySelector(`[data-category="${category}"] .progress-bar`);
                if (progressBar) {
                    progressBar.style.width = `${Math.min(percentage, 100)}%`;
                }
            });
        }
    };

    // Transaction Form Enhancements
    const transactionForm = document.getElementById('add-transaction-form');
    if (transactionForm) {
        const nameInput = transactionForm.querySelector('#transaction-name');
        const amountInput = transactionForm.querySelector('#transaction-amount');
        const categorySelect = transactionForm.querySelector('#transaction-category');
        const makeRecurringCheckbox = transactionForm.querySelector('#make-recurring');
        const recurringOptions = transactionForm.querySelector('.recurring-options');
        const hasReceiptCheckbox = transactionForm.querySelector('#has-receipt');
        const receiptUpload = transactionForm.querySelector('.receipt-upload');
        const amountSuggestion = transactionForm.querySelector('.amount-suggestion');
        const categoryBudgetInfo = transactionForm.querySelector('.category-budget-info');
        
        // Smart categorization based on hashtags
        nameInput.addEventListener('input', function() {
            const hashtags = this.value.match(/#\w+/g);
            if (hashtags) {
                const category = hashtags[0].substring(1).toLowerCase();
                const categoryOption = Array.from(categorySelect.options)
                    .find(option => option.value === category);
                
                if (categoryOption) {
                    categorySelect.value = category;
                    updateCategoryBudgetInfo(category);
                }
            }
        });

        // Transaction name suggestions
        function updateTransactionSuggestions() {
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const datalist = document.getElementById('transaction-suggestions');
            const uniqueNames = [...new Set(transactions.map(t => t.name))];
            
            datalist.innerHTML = uniqueNames
                .map(name => `<option value="${name}">`)
                .join('');
        }

        // Amount suggestions based on similar transactions
        amountInput.addEventListener('focus', function() {
            const name = nameInput.value;
            if (name.length < 3) return;

            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const similarTransactions = transactions.filter(t => 
                t.name.toLowerCase().includes(name.toLowerCase())
            );

            if (similarTransactions.length > 0) {
                const average = similarTransactions.reduce((sum, t) => sum + t.amount, 0) / similarTransactions.length;
                amountSuggestion.style.display = 'block';
                amountSuggestion.querySelector('.suggestion-text').textContent = 
                    `Similar transactions average: ${formatCurrency(average)}`;
                
                amountSuggestion.querySelector('.suggestion-btn').onclick = () => {
                    amountInput.value = average.toFixed(2);
                    validateInput(amountInput);
                updateSubmitButton();
                };
            }
        });

        // Category budget information
        function updateCategoryBudgetInfo(category) {
            const budgetData = BudgetDataManager.data.categories[category];
            if (!budgetData) return;

            const spent = budgetData.spent;
            const budget = budgetData.budget;
            const percentage = (spent / budget) * 100;
            
            categoryBudgetInfo.style.display = 'block';
            categoryBudgetInfo.querySelector('.progress-bar').style.width = `${percentage}%`;
            
            const status = categoryBudgetInfo.querySelector('.budget-status');
            status.textContent = `${formatCurrency(spent)} of ${formatCurrency(budget)} spent`;
            
            // Add warning if close to budget
            if (percentage > 80) {
                status.classList.add('warning');
                showToast('Warning: Close to budget limit for this category', 'warning');
            } else {
                status.classList.remove('warning');
            }
        }

        categorySelect.addEventListener('change', function() {
            updateCategoryBudgetInfo(this.value);
        });

        // Location suggestions
        const locationInput = transactionForm.querySelector('#transaction-location');
        function updateLocationSuggestions() {
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const datalist = document.getElementById('location-suggestions');
            const uniqueLocations = [...new Set(transactions
                .filter(t => t.location)
                .map(t => t.location))];
            
            datalist.innerHTML = uniqueLocations
                .map(location => `<option value="${location}">`)
                .join('');
        }

        // Recurring transaction handling
        makeRecurringCheckbox.addEventListener('change', function() {
            recurringOptions.style.display = this.checked ? 'block' : 'none';
            validateForm();
        });

        // Receipt upload handling
        hasReceiptCheckbox.addEventListener('change', function() {
            receiptUpload.style.display = this.checked ? 'block' : 'none';
        });

        const receiptInput = transactionForm.querySelector('#receipt-file');
        receiptInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showToast('File size exceeds 5MB limit', 'error');
                    this.value = '';
                    return;
                }
                
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    showToast('Invalid file type. Please upload an image or PDF', 'error');
                    this.value = '';
                    return;
                }
            }
        });

        // Enhanced form submission
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const transaction = {
                id: Date.now(),
                type: formData.get('transaction-type'),
                name: formData.get('transaction-name'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                date: formData.get('date'),
                location: formData.get('location'),
                tags: formData.get('tags')?.split(',').map(tag => tag.trim()) || [],
                note: formData.get('notes') || '',
                isRecurring: formData.get('make-recurring') === 'on',
                recurringFrequency: formData.get('frequency'),
                recurringEndDate: formData.get('recurring-end'),
                hasReceipt: formData.get('has-receipt') === 'on',
                timestamp: new Date().toISOString()
            };

            // Handle receipt file
            if (transaction.hasReceipt && receiptInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    transaction.receiptData = e.target.result;
                    saveTransaction(transaction);
                };
                reader.readAsDataURL(receiptInput.files[0]);
            } else {
                saveTransaction(transaction);
            }
        });

        function saveTransaction(transaction) {
            // Save to storage
            BudgetDataManager.addTransaction(transaction);

            // Update suggestions
            updateTransactionSuggestions();
            updateLocationSuggestions();

            // Show success message
            showToast('Transaction saved successfully!');

            // Reset form
            transactionForm.reset();
            dateInput.valueAsDate = new Date();
            amountSuggestion.style.display = 'none';
            categoryBudgetInfo.style.display = 'none';
            recurringOptions.style.display = 'none';
            receiptUpload.style.display = 'none';

            // Navigate back
            showBudgetScreen('manage-budget-main');

            // If it's a recurring transaction, add it to localStorage
            if (transaction.isRecurring) {
                const recurring = JSON.parse(localStorage.getItem('recurring') || '[]');
                recurring.push({
                    ...transaction,
                    startDate: transaction.date,
                    endDate: transaction.recurringEndDate,
                    nextDueDate: calculateNextDueDate(transaction.date, transaction.frequency)
                });
                localStorage.setItem('recurring', JSON.stringify(recurring));
                showToast('Recurring transaction saved!', 'success');
            }
        }

        // Initialize suggestions
        updateTransactionSuggestions();
        updateLocationSuggestions();
    }

    // Helper function to calculate next due date
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

    // Process recurring transactions on app startup
    document.addEventListener('DOMContentLoaded', () => {
        const today = new Date().toISOString().split('T')[0];
        const recurring = JSON.parse(localStorage.getItem('recurring') || '[]');
        let updated = false;

        recurring.forEach(recurring => {
            if (recurring.nextDueDate <= today) {
                // Check if we've passed the end date
                if (recurring.endDate && recurring.endDate < today) {
                    return;
                }

                // Create regular transaction
                const transaction = {
                    id: Date.now(),
                    name: recurring.name,
                    amount: recurring.amount,
                    category: recurring.category,
                    date: recurring.nextDueDate,
                    type: recurring.type,
                    note: recurring.note,
                    isRecurring: true,
                    recurringId: recurring.id
                };

                // Add to regular transactions
                BudgetDataManager.addTransaction(transaction);

                // Update next due date
                recurring.nextDueDate = calculateNextDueDate(
                    recurring.nextDueDate,
                    recurring.frequency
                );
                
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('recurring', JSON.stringify(recurring));
        }
    });

    // Update BudgetDataManager to handle recurring transactions in reports
    Object.assign(BudgetDataManager, {
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
        },
        
        updateRecentActivity() {
            // ... existing updateRecentActivity code ...
            
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
        }
    });
});
