// Budget Management

import { showToast } from './utils.js';

const BudgetManager = {
    data: {
        allocations: JSON.parse(localStorage.getItem('budget_allocations') || '[]'),
        totalBudget: 3500 // Default total budget
    },

    init() {
        console.log('BudgetManager.init() called');
        this.loadAllocations();
        this.setupEventListeners();
        this.updateViewBudgetButtonState();
    },

    setupEventListeners() {
        console.log('Setting up budget event listeners');
        
        // Back button
        const backBtn = document.querySelector('#adjust-budget-screen .back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('Back button clicked');
                document.getElementById('adjust-budget-screen').classList.remove('active');
                document.getElementById('manage-budget-main').classList.add('active');
            });
        }

        // View Budget button
        const viewBudgetBtn = document.querySelector('.view-budget-btn');
        if (viewBudgetBtn) {
            viewBudgetBtn.addEventListener('click', (e) => {
                if (viewBudgetBtn.classList.contains('disabled')) {
                    e.preventDefault();
                    showToast('No budget allocations available to view', 'info');
                    return;
                }
                console.log('View Budget button clicked');
                this.navigateToViewBudgetScreen();
            });
        }

        // Back button in view budget screen
        const viewBudgetBackBtn = document.querySelector('#view-budget-screen .back-btn');
        if (viewBudgetBackBtn) {
            viewBudgetBackBtn.addEventListener('click', () => {
                console.log('View Budget back button clicked');
                this.navigateToAdjustBudgetScreen();
            });
        }

        // Add New Category button in view budget screen
        const addCategoryBtn = document.querySelector('#view-budget-screen .add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                console.log('Add New Category button clicked');
                this.navigateToAdjustBudgetScreen();
            });
        }

        // Clear All Categories button
        const resetBudgetBtn = document.querySelector('.reset-budget-btn');
        if (resetBudgetBtn) {
            resetBudgetBtn.addEventListener('click', () => {
                console.log('Reset Budget button clicked');
                if (confirm('Are you sure you want to reset all budget allocations? This cannot be undone.')) {
                    this.resetAllAllocations();
                }
            });
        }

        // Form submission
        const budgetForm = document.querySelector('#adjust-budget-form');
        console.log('Budget form found:', budgetForm);
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                console.log('Budget form submitted');
                e.preventDefault();
                this.handleBudgetSubmit(e);
            });

            // Reset button
            const resetBtn = budgetForm.querySelector('[type="reset"]');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    console.log('Reset button clicked');
                    this.resetForm();
                });
            }
        }

        // Budget allocation actions (Edit, Delete) delegation
        const allocationsListElements = document.querySelectorAll('.allocations-list');
        allocationsListElements.forEach(list => {
            list.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.allocation-action-btn.edit');
                const deleteBtn = e.target.closest('.allocation-action-btn.delete');
                
                if (editBtn) {
                    const allocationId = editBtn.closest('.allocation-item').dataset.id;
                    this.editAllocation(allocationId);
                } else if (deleteBtn) {
                    const allocationId = deleteBtn.closest('.allocation-item').dataset.id;
                    if (confirm('Are you sure you want to delete this budget allocation?')) {
                        this.deleteAllocation(allocationId);
                    }
                }
            });
        });
    },

    loadAllocations() {
        console.log('Loading budget allocations');
        // Update budget stats and view button state
        this.updateBudgetStats();
        this.updateViewBudgetButtonState();
        
        // If view-budget-screen is visible, render allocations there
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.renderViewBudget();
        }
    },

    updateViewBudgetButtonState() {
        const viewBudgetBtn = document.querySelector('.view-budget-btn');
        if (!viewBudgetBtn) return;

        if (this.data.allocations.length === 0) {
            viewBudgetBtn.classList.add('disabled');
            viewBudgetBtn.title = 'No budget allocations to view';
        } else {
            viewBudgetBtn.classList.remove('disabled');
            viewBudgetBtn.title = 'View budget allocations';
        }
    },

    renderAllocations() {
        // We no longer need to render allocations in the adjust-budget-screen
        // as they've been moved to the view-budget-screen
        
        // If view-budget-screen is visible, update it
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.renderViewBudget();
        }
    },

    createAllocationHTML(allocation) {
        // Calculate percentage of total budget
        const percentage = Math.round((allocation.amount / this.data.totalBudget) * 100);
        
        // Determine emoji/icon based on category
        let emoji = '💰';
        switch (allocation.category.toLowerCase()) {
            case 'housing': emoji = '🏠'; break;
            case 'transportation': emoji = '🚗'; break;
            case 'food': emoji = '🍽️'; break;
            case 'utilities': emoji = '💡'; break;
            case 'entertainment': emoji = '🎬'; break;
            case 'shopping': emoji = '🛍️'; break;
            case 'health': emoji = '⚕️'; break;
            case 'personal': emoji = '👤'; break;
            case 'education': emoji = '📚'; break;
            case 'travel': emoji = '✈️'; break;
            case 'savings': emoji = '💰'; break;
            default: emoji = '💵'; break;
        }

        return `
            <div class="allocation-item" data-id="${allocation.id}">
                <div class="allocation-header">
                    <div class="allocation-info">
                        <div class="allocation-icon">${emoji}</div>
                        <div class="allocation-details">
                            <div class="allocation-name">${allocation.category}</div>
                        </div>
                    </div>
                    <div class="allocation-status">${percentage}% of total</div>
                </div>
                <div class="allocation-progress-container">
                    <div class="allocation-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="allocation-amounts">
                    <span>$${allocation.amount.toFixed(2)}</span>
                    <span>of $${this.data.totalBudget.toFixed(2)}</span>
                </div>
                <div class="allocation-actions">
                    <button class="allocation-action-btn edit">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Edit
                    </button>
                    <button class="allocation-action-btn delete">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    handleBudgetSubmit(e) {
        const form = e.target;
        console.log('Handling budget submit');

        const category = document.getElementById('category-name').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const notes = document.getElementById('budget-notes').value || '';

        // Check if this category already exists
        const existingIndex = this.data.allocations.findIndex(
            a => a.category.toLowerCase() === category.toLowerCase()
        );

        if (existingIndex >= 0) {
            // Update existing allocation
            this.data.allocations[existingIndex].amount = amount;
            this.data.allocations[existingIndex].notes = notes;
            showToast(`${category} budget updated successfully!`, 'success');
        } else {
            // Add new allocation
            const allocation = {
                id: `allocation${Date.now()}`,
                category: category,
                amount: amount,
                notes: notes,
                date: new Date().toISOString()
            };

            console.log('New allocation data:', allocation);
            this.data.allocations.push(allocation);
            showToast(`${category} budget added successfully!`, 'success');
        }

        // Save to localStorage
        localStorage.setItem('budget_allocations', JSON.stringify(this.data.allocations));
        
        // Reset form and update UI
        this.resetForm();
        this.loadAllocations();
        
        // Update view budget screen if it's visible
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.renderViewBudget();
        }
        
        this.updateViewBudgetButtonState();
    },

    resetForm() {
        const form = document.getElementById('adjust-budget-form');
        if (form) {
            form.reset();
        }
    },

    editAllocation(allocationId) {
        const allocation = this.data.allocations.find(a => a.id === allocationId);
        if (!allocation) return;

        // Navigate to adjust budget screen if we're in view budget screen
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.navigateToAdjustBudgetScreen();
        }

        // Populate the form with allocation data
        document.getElementById('category-name').value = allocation.category;
        document.getElementById('budget-amount').value = allocation.amount;
        document.getElementById('budget-notes').value = allocation.notes || '';

        // Scroll to the form
        document.getElementById('adjust-budget-form').scrollIntoView({ behavior: 'smooth' });
    },

    deleteAllocation(allocationId) {
        this.data.allocations = this.data.allocations.filter(a => a.id !== allocationId);
        localStorage.setItem('budget_allocations', JSON.stringify(this.data.allocations));
        this.loadAllocations();
        
        // Update view budget screen if it's visible
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.renderViewBudget();
        }
        
        this.updateViewBudgetButtonState();
        showToast('Budget allocation deleted successfully', 'info');
    },

    resetAllAllocations() {
        this.data.allocations = [];
        localStorage.setItem('budget_allocations', JSON.stringify(this.data.allocations));
        this.loadAllocations();
        
        // Update view budget screen if it's visible
        if (document.getElementById('view-budget-screen').classList.contains('active')) {
            this.renderViewBudget();
        }
        
        this.updateViewBudgetButtonState();
        showToast('All budget allocations have been reset', 'info');
    },

    navigateToAdjustBudgetScreen() {
        document.getElementById('view-budget-screen').classList.remove('active');
        document.getElementById('adjust-budget-screen').classList.add('active');
    },

    navigateToViewBudgetScreen() {
        document.getElementById('adjust-budget-screen').classList.remove('active');
        document.getElementById('view-budget-screen').classList.add('active');
        
        // Explicitly render allocations in the view screen
        this.renderViewBudget();
        this.updateBudgetStats();
    },

    renderViewBudget() {
        const viewBudgetList = document.querySelector('#view-budget-screen .allocations-list');
        if (!viewBudgetList) return;
        
        if (this.data.allocations.length === 0) {
            viewBudgetList.innerHTML = `
                <div class="empty-state">
                    <p>You don't have any budget allocations yet.</p>
                    <p>Use the form to create your first budget allocation!</p>
                </div>
            `;
        } else {
            viewBudgetList.innerHTML = this.data.allocations
                .map(allocation => this.createAllocationHTML(allocation))
                .join('');
        }
    },

    updateBudgetStats() {
        const totalAllocated = this.data.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
        const totalUnallocated = this.data.totalBudget - totalAllocated;
        const allocatedPercentage = Math.round((totalAllocated / this.data.totalBudget) * 100);
        const unallocatedPercentage = 100 - allocatedPercentage;

        // Update stats in the view budget screen
        const statsValues = document.querySelectorAll('#view-budget-screen .stats-value');
        if (statsValues.length >= 4) {
            statsValues[0].textContent = this.data.allocations.length; // Total Categories
            statsValues[1].textContent = `$${this.data.totalBudget.toFixed(2)}`; // Total Budget
            statsValues[2].textContent = `$${totalAllocated.toFixed(2)} (${allocatedPercentage}%)`; // Allocated
            statsValues[3].textContent = `$${totalUnallocated.toFixed(2)} (${unallocatedPercentage}%)`; // Unallocated
        }

        // Update the budget overview in adjust budget screen
        const progressBar = document.querySelector('#adjust-budget-screen .progress-bar');
        const progressLabel = document.querySelector('#adjust-budget-screen .progress-label');
        
        if (progressBar && progressLabel) {
            progressBar.style.width = `${allocatedPercentage}%`;
            progressLabel.textContent = `$${totalAllocated.toFixed(2)} allocated of $${this.data.totalBudget.toFixed(2)}`;
        }
    }
};

export default BudgetManager; 