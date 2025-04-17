// Main application script

// Remove import statements - all dependencies are now global via script tags

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Settings
    initializeSettings();
    
    // Initialize Tab Navigation
    initializeTabNavigation();
    
    // Initialize Reports Navigation
    initializeReportsNavigation();
    
    // Process recurring transactions on app startup
    processRecurringTransactions();
    
    // Transaction Management
    setupTransactionForms();
    
    // Initialize Virtual Keyboard
    let keyboard = null;
    
    if (settings.virtualKeyboard) {
        keyboard = new VirtualKeyboard({
            theme: settings.darkMode ? 'dark-theme' : 'light-theme',
            container: document.querySelector('.phone-frame') || document.body
        });
        
        // Handle the case when keyboard is open and user taps outside the keyboard or active input
        document.addEventListener('click', function(e) {
            if (keyboard && keyboard.isOpen) {
                // Check if clicked element is not the keyboard, its children, or the active input
                if (!keyboard.keyboardElement.contains(e.target) && 
                    e.target !== keyboard.activeInput &&
                    !e.target.closest('.keyboard-key')) {
                    keyboard.close();
                }
            }
        });
        
        // Handle bottom navigation clicks when keyboard is open
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.addEventListener('click', function() {
                if (keyboard && keyboard.isOpen) {
                    keyboard.close();
                }
            });
        }
    }
    
    // The keyboard will now automatically detect dark mode changes via MutationObserver
    // No need for manual theme changing via events anymore
    
    // Listen for keyboard setting changes
    document.addEventListener('keyboardSettingChanged', function(e) {
        if (e.detail.enabled) {
            // Create keyboard if it doesn't exist
            if (!keyboard) {
                keyboard = new VirtualKeyboard({
                    container: document.querySelector('.phone-frame') || document.body
                });
            }
        } else {
            // Remove keyboard if it exists
            if (keyboard) {
                const keyboardElement = document.getElementById('virtual-keyboard');
                if (keyboardElement) {
                    keyboardElement.remove();
                }
                keyboard = null;
            }
        }
    });
    
    // Event delegation for screen navigation
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen) {
            event.preventDefault();
            showBudgetScreen(button.dataset.screen);
            
            // Initialize transaction form when Add Transaction button is clicked
            if (button.dataset.screen === 'add-transaction-screen') {
                const transactionForm = document.getElementById('add-transaction-form');
                if (transactionForm) {
                    // Reset form on every open
                    transactionForm.reset();
                    
                    // Set default date
                    const dateInput = transactionForm.querySelector('input[type="date"]');
                    if (dateInput) {
                        dateInput.valueAsDate = new Date();
                    }
                    
                    // Reset validation styling
                    const inputWrappers = transactionForm.querySelectorAll('.input-wrapper, .amount-input-wrapper');
                    inputWrappers.forEach(wrapper => {
                        wrapper.classList.remove('valid');
                        wrapper.classList.remove('invalid');
                    });
                    
                    const errorMessages = transactionForm.querySelectorAll('.error-message');
                    errorMessages.forEach(msg => {
                        msg.textContent = '';
                    });
                    
                    // Disable submit button initially
                    const submitButton = transactionForm.querySelector('.submit-btn');
                    if (submitButton) {
                        submitButton.disabled = true;
                        submitButton.classList.remove('loading');
                        submitButton.innerHTML = 'Add Transaction';
                    }
                    
                    // Update suggestions
                    updateTransactionSuggestions();
                    updateLocationSuggestions();
                }
            }
        }

        // Handle back buttons
        if (event.target.closest('.back-btn')) {
            event.preventDefault();
            showBudgetScreen('manage-budget-main');
        }
    });
    
    // Initialize Bills Manager when the bills screen is shown
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen === 'bills-screen') {
            BillsManager.init();
        }
    });
    
    // Initialize Goals Manager on page load if savings tab is active
    const activeTab = document.querySelector('.nav-item.active .nav-text');
    if (activeTab && activeTab.textContent.toLowerCase() === 'savings') {
        console.log('Initializing GoalsManager on page load');
        GoalsManager.init();
    }
    
    // Initialize Goals Manager when the goals screen is shown
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen === 'goals-screen') {
                GoalsManager.init();
            }
    });
    
    // Modify the GoalsManager initialization
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen === 'set-goal-screen') {
            console.log('Set Goal screen button clicked');
            const goalScreen = document.getElementById('set-goal-screen');
            if (goalScreen) {
                console.log('Showing Set Goal screen');
                const screens = document.querySelectorAll('.manage-budget-screen');
                screens.forEach(screen => screen.classList.remove('active'));
                goalScreen.classList.add('active');
                GoalsManager.init();
            }
        }
    });
    
    // Initialize Budget Manager when the adjust budget screen is shown
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (button && button.dataset.screen === 'adjust-budget-screen') {
            console.log('Adjust Budget screen button clicked');
            BudgetManager.init();
        }
    });
    
    // Make GoalsManager globally accessible for tab navigation
    window.GoalsManager = GoalsManager;
});

// Process recurring transactions
function processRecurringTransactions() {
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
}

// Transaction suggestions functions
function updateTransactionSuggestions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const datalist = document.getElementById('transaction-suggestions');
    if (!datalist) return;
    
    const uniqueNames = [...new Set(transactions.map(t => t.name))];
    
    datalist.innerHTML = uniqueNames
        .map(name => `<option value="${name}">`)
        .join('');
}

function updateLocationSuggestions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const datalist = document.getElementById('location-suggestions');
    if (!datalist) return;
    
    const uniqueLocations = [...new Set(transactions
        .filter(t => t.location)
        .map(t => t.location))];
    
    datalist.innerHTML = uniqueLocations
        .map(location => `<option value="${location}">`)
        .join('');
}

// Create or update Category Budget Info function
function updateCategoryBudgetInfo(category) {
    const budgetData = BudgetDataManager.data.categories[category];
    const categoryBudgetInfo = document.querySelector('.category-budget-info');
    if (!budgetData || !categoryBudgetInfo) return;

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

// Transaction Form Handling
function setupTransactionForms() {
    // Add event listeners for transaction forms
    const transactionForms = document.querySelectorAll('.expense-form');
    transactionForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, this would save to a database
            const formData = new FormData(form);
            console.log('Transaction saved:', Object.fromEntries(formData));
            
            // Show success message
            showToast('Transaction saved successfully!');
            
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

    // Handle Transaction Form
    const transactionForm = document.getElementById('add-transaction-form');
    if (transactionForm) {
        setupTransactionForm(transactionForm);
    }
}

function setupTransactionForm(transactionForm) {
        const nameInput = transactionForm.querySelector('#transaction-name');
        const amountInput = transactionForm.querySelector('#transaction-amount');
        const categorySelect = transactionForm.querySelector('#transaction-category');
        const makeRecurringCheckbox = transactionForm.querySelector('#make-recurring');
        const recurringOptions = transactionForm.querySelector('.recurring-options');
        const hasReceiptCheckbox = transactionForm.querySelector('#has-receipt');
        const receiptUpload = transactionForm.querySelector('.receipt-upload');
        const amountSuggestion = transactionForm.querySelector('.amount-suggestion');
        const categoryBudgetInfo = transactionForm.querySelector('.category-budget-info');
        const submitButton = transactionForm.querySelector('.submit-btn');
        const dateInput = transactionForm.querySelector('#transaction-date');
        const locationInput = transactionForm.querySelector('#transaction-location');
        
        // Set default date to today
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // Enable form validation and submit button logic
        const requiredFields = transactionForm.querySelectorAll('[required]');
        
        // Form validation function to enable/disable submit button
        function validateForm() {
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value) {
                    isValid = false;
                    showInvalidField(field);
                } else {
                    showValidField(field);
                }
            });
            
            submitButton.disabled = !isValid;
            return isValid;
        }
        
        // Show visual indication of invalid field
        function showInvalidField(field) {
            const wrapper = field.closest('.input-wrapper') || field.parentNode;
            const errorMessage = wrapper.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                if (!field.value) {
                    errorMessage.textContent = 'This field is required';
                }
                wrapper.classList.add('invalid');
                wrapper.classList.remove('valid');
            }
        }
        
        // Show visual indication of valid field
        function showValidField(field) {
            const wrapper = field.closest('.input-wrapper') || field.parentNode;
            const errorMessage = wrapper.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.textContent = '';
                wrapper.classList.remove('invalid');
                wrapper.classList.add('valid');
            }
        }
        
        // Add validation listeners to all required fields
        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                if (field.value) {
                    showValidField(field);
                } else {
                    showInvalidField(field);
                }
                validateForm();
            });
            
            field.addEventListener('blur', () => {
                if (!field.value) {
                    showInvalidField(field);
                }
                validateForm();
            });
        });
        
        // Amount validation for non-negative numbers
        amountInput?.addEventListener('input', function() {
            if (this.value && parseFloat(this.value) <= 0) {
                const wrapper = this.closest('.amount-input-wrapper');
                const errorMessage = wrapper.nextElementSibling;
                if (errorMessage) {
                    errorMessage.textContent = 'Amount must be greater than zero';
                    wrapper.classList.add('invalid');
                    wrapper.classList.remove('valid');
                }
            }
            validateForm();
        });
        
        // Smart categorization based on hashtags
    nameInput?.addEventListener('input', function() {
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
            
            // Validate form after input
            validateForm();
        });

        // Transaction name suggestions
        updateTransactionSuggestions();

        // Amount suggestions based on similar transactions
    amountInput?.addEventListener('focus', function() {
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
                };
            }
        });

        // Category budget information
    categorySelect?.addEventListener('change', function() {
            updateCategoryBudgetInfo(this.value);
        });

        // Recurring transaction handling
    makeRecurringCheckbox?.addEventListener('change', function() {
            recurringOptions.style.display = this.checked ? 'block' : 'none';
        });

        // Receipt upload handling
    hasReceiptCheckbox?.addEventListener('change', function() {
            receiptUpload.style.display = this.checked ? 'block' : 'none';
        });

        const receiptInput = transactionForm.querySelector('#receipt-file');
    receiptInput?.addEventListener('change', function() {
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
    transactionForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Final validation before submission
            if (!validateForm()) {
                showToast('Please fill in all required fields correctly', 'error');
                return;
            }
            
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
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };

            // Show loading state
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            submitButton.innerHTML = 'Saving...';

            // Handle receipt file
            if (transaction.hasReceipt && receiptInput?.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    transaction.receiptData = e.target.result;
                    saveTransaction(transaction);
                };
                reader.readAsDataURL(receiptInput.files[0]);
            } else {
                // Simulate slight delay for better UX
                setTimeout(() => {
                    saveTransaction(transaction);
                }, 500);
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
        if (transactionForm.querySelector('input[type="date"]')) {
            transactionForm.querySelector('input[type="date"]').valueAsDate = new Date();
        }
        if (amountSuggestion) amountSuggestion.style.display = 'none';
        if (categoryBudgetInfo) categoryBudgetInfo.style.display = 'none';
        if (recurringOptions) recurringOptions.style.display = 'none';
        if (receiptUpload) receiptUpload.style.display = 'none';
            
            // Restore submit button state
            submitButton.disabled = true;
            submitButton.classList.remove('loading');
            submitButton.innerHTML = 'Add Transaction';
            
            // Reset validation styling
            const inputWrappers = transactionForm.querySelectorAll('.input-wrapper, .amount-input-wrapper');
            inputWrappers.forEach(wrapper => {
                wrapper.classList.remove('valid');
                wrapper.classList.remove('invalid');
            });
            
            const errorMessages = transactionForm.querySelectorAll('.error-message');
            errorMessages.forEach(msg => {
                msg.textContent = '';
            });

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
            
            // Update UI with new transaction data
            BudgetDataManager.updateUI();
        }

        // Initialize suggestions
        updateTransactionSuggestions();
        updateLocationSuggestions();
    }
