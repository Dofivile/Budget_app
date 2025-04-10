// Goals Management

import { showToast } from './utils.js';

const GoalsManager = {
    data: {
        goals: JSON.parse(localStorage.getItem('goals') || '[]')
    },

    init() {
        console.log('GoalsManager.init() called');
        // No longer initialize sample goals
        this.setupEventListeners();
        this.loadGoals();
        this.updateViewGoalsButtonState();
    },

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Back button
        const backBtn = document.querySelector('#set-goal-screen .back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('Back button clicked');
                document.getElementById('set-goal-screen').classList.remove('active');
                document.getElementById('manage-budget-main').classList.add('active');
            });
        }

        // View Goals button
        const viewGoalsBtn = document.querySelector('.view-goals-btn');
        if (viewGoalsBtn) {
            viewGoalsBtn.addEventListener('click', (e) => {
                if (viewGoalsBtn.classList.contains('disabled')) {
                    e.preventDefault();
                    showToast('No goals available to view', 'info');
                    return;
                }
                console.log('View Goals button clicked');
                this.navigateToViewGoalsScreen();
            });
        }

        // Back button in view goals screen
        const viewGoalsBackBtn = document.querySelector('#view-goals-screen .back-btn');
        if (viewGoalsBackBtn) {
            viewGoalsBackBtn.addEventListener('click', () => {
                console.log('View Goals back button clicked');
                this.navigateToSetGoalScreen();
            });
        }

        // Add New Goal button in view goals screen
        const addGoalBtn = document.querySelector('#view-goals-screen .add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                console.log('Add New Goal button clicked');
                this.navigateToSetGoalScreen();
            });
        }

        // Clear All Goals button
        const clearAllGoalsBtn = document.querySelector('.clear-all-goals-btn');
        if (clearAllGoalsBtn) {
            clearAllGoalsBtn.addEventListener('click', () => {
                console.log('Clear All Goals button clicked');
                if (confirm('Are you sure you want to delete all goals? This cannot be undone.')) {
                    this.clearAllGoals();
                }
            });
        }

        // Form submission
        const goalForm = document.querySelector('#set-goal-screen .goal-form');
        console.log('Goal form found:', goalForm);
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                console.log('Goal form submitted');
                e.preventDefault();
                this.handleGoalSubmit(e);
            });

            // Reset button (previously Cancel)
            const resetBtn = goalForm.querySelector('[type="reset"]');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    console.log('Reset button clicked');
                    this.resetForm();
                });
            }
        }

        // Goal actions (Add Funds, Delete) in set-goal-screen
        const goalsList = document.querySelector('#set-goal-screen .goals-list');
        if (goalsList) {
            goalsList.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.goal-action-btn');
                if (!actionBtn) return;

                console.log('Goal action button clicked:', actionBtn.textContent.trim());
                const goalItem = actionBtn.closest('.goal-item');
                const goalId = goalItem.dataset.goalId;
                const action = actionBtn.textContent.trim();

                switch (action) {
                    case 'Add Funds':
                        this.showAddFundsModal(goalId);
                        break;
                    case 'Delete':
                        this.deleteGoal(goalId);
                        break;
                }
            });
        }

        // Goal actions (Add Funds, Delete) in view-goals-screen
        const viewGoalsList = document.querySelector('#view-goals-screen .goals-list');
        if (viewGoalsList) {
            viewGoalsList.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.goal-action-btn');
                if (!actionBtn) return;

                console.log('View screen goal action button clicked:', actionBtn.textContent.trim());
                const goalItem = actionBtn.closest('.goal-item');
                const goalId = goalItem.dataset.goalId;
                const action = actionBtn.textContent.trim();

                switch (action) {
                    case 'Add Funds':
                        this.showAddFundsModal(goalId);
                        break;
                    case 'Delete':
                        this.deleteGoal(goalId);
                        break;
                }
            });
        }
    },

    loadGoals() {
        console.log('Loading goals');
        const goalsList = document.querySelector('.goals-list');
        console.log('Goals list element found:', goalsList);
        if (!goalsList) return;

        // Update total goals count (only truly active goals)
        const totalGoals = this.data.goals.filter(goal => goal.active === true).length;
        const totalGoalsElement = document.querySelector('.total-goals .amount');
        console.log('Total goals:', totalGoals);
        if (totalGoalsElement) {
            totalGoalsElement.textContent = totalGoals;
        }

        // Update View Goals button state
        this.updateViewGoalsButtonState();

        // Render goals
        this.renderGoals();
    },

    updateViewGoalsButtonState() {
        const viewGoalsBtn = document.querySelector('.view-goals-btn');
        if (!viewGoalsBtn) return;

        // Check if there are any goals at all
        const hasGoals = this.data.goals.length > 0;
        console.log('Goals count for button state:', this.data.goals.length);
        
        if (hasGoals) {
            viewGoalsBtn.classList.remove('disabled');
            viewGoalsBtn.disabled = false;
        } else {
            viewGoalsBtn.classList.add('disabled');
            viewGoalsBtn.disabled = true;
        }
    },

    renderGoals() {
        // Update goals in set-goal-screen
        const goalsList = document.querySelector('#set-goal-screen .goals-list');
        if (goalsList) {
            // Show all goals
            console.log('Goals count for rendering:', this.data.goals.length);
            
            if (this.data.goals.length === 0) {
                goalsList.innerHTML = `
                    <div class="empty-state">
                        <p>You don't have any goals yet.</p>
                        <p>Use the form to create your first financial goal!</p>
                    </div>
                `;
            } else {
                goalsList.innerHTML = this.data.goals
                    .map(goal => this.createGoalHTML(goal))
                    .join('');
            }
        }
    },
    
    validateGoalsData() {
        // Check if goals data is valid and fix any issues
        if (!Array.isArray(this.data.goals)) {
            console.error('Goals data is not an array, resetting');
            this.data.goals = [];
            localStorage.setItem('goals', JSON.stringify(this.data.goals));
            return;
        }
        
        // Remove any invalid goals
        const validGoals = this.data.goals.filter(goal => {
            return goal && 
                   typeof goal === 'object' && 
                   typeof goal.id === 'string' &&
                   typeof goal.name === 'string';
        });
        
        // Update goals if any were removed
        if (validGoals.length !== this.data.goals.length) {
            console.warn('Removed invalid goals:', this.data.goals.length - validGoals.length);
            this.data.goals = validGoals;
            localStorage.setItem('goals', JSON.stringify(this.data.goals));
        }
    },
    
    repairGoalsData() {
        // Attempt to repair corrupted goals data
        try {
            const fixedGoals = this.data.goals.map(goal => {
                return {
                    id: goal.id || `goal${Date.now()}`,
                    name: goal.name || 'Unnamed Goal',
                    targetAmount: typeof goal.targetAmount === 'number' ? goal.targetAmount : 0,
                    currentAmount: typeof goal.currentAmount === 'number' ? goal.currentAmount : 0,
                    targetDate: goal.targetDate || new Date().toISOString().split('T')[0],
                    category: goal.category || 'Other',
                    monthlyContribution: typeof goal.monthlyContribution === 'number' ? goal.monthlyContribution : 0,
                    notes: goal.notes || '',
                    active: goal.active !== false
                };
            });
            
            this.data.goals = fixedGoals;
            localStorage.setItem('goals', JSON.stringify(fixedGoals));
            console.log('Goals data repaired');
            
            // Show notification to user
            showToast('Goals data has been repaired', 'info');
        } catch (error) {
            console.error('Could not repair goals data:', error);
            // If all else fails, reset goals
            this.data.goals = [];
            localStorage.setItem('goals', JSON.stringify([]));
            showToast('Goals data has been reset due to corruption', 'warning');
        }
    },

    navigateToSetGoalScreen() {
        document.getElementById('view-goals-screen').classList.remove('active');
        document.getElementById('set-goal-screen').classList.add('active');
    },

    updateGoalStats() {
        const goalStats = document.querySelector('.goal-stats');
        if (!goalStats) return;
        
        const totalSaved = this.data.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        const totalTarget = this.data.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const averageProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
        
        goalStats.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${this.data.goals.length}</div>
                <div class="stat-label">Goals</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">$${totalSaved.toFixed(2)}</div>
                <div class="stat-label">Total Saved</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${averageProgress.toFixed(1)}%</div>
                <div class="stat-label">Avg Progress</div>
            </div>
        `;
    },

    createGoalHTML(goal) {
        // Make sure goal has required properties with default values
        if (!goal) {
            console.error('Invalid goal object:', goal);
            return '';
        }
        
        // Ensure all required properties exist with default values
        const safeGoal = {
            id: goal.id || `goal${Date.now()}`,
            name: goal.name || 'Unnamed Goal',
            targetAmount: typeof goal.targetAmount === 'number' ? goal.targetAmount : 0,
            currentAmount: typeof goal.currentAmount === 'number' ? goal.currentAmount : 0,
            targetDate: goal.targetDate || new Date().toISOString().split('T')[0],
            active: goal.active !== false
        };
        
        // Calculate progress using the safe values
        const progress = (safeGoal.currentAmount / (safeGoal.targetAmount || 1)) * 100;
        const formattedProgress = Math.min(progress, 100).toFixed(1);

        return `
            <div class="goal-item" data-goal-id="${safeGoal.id}">
                <div class="goal-info">
                    <div class="goal-icon">🎯</div>
                    <div class="goal-details">
                        <span class="goal-name">${safeGoal.name}</span>
                        <div class="goal-amounts">$${safeGoal.currentAmount.toFixed(2)} of $${safeGoal.targetAmount.toFixed(2)}</div>
                        <div class="goal-status">Active ${formattedProgress}%</div>
                    </div>
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${formattedProgress}%"></div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="goal-action-btn add-funds">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                        Add Funds
                    </button>
                    <button class="goal-action-btn delete">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    handleGoalSubmit(e) {
        const form = e.target;
        console.log('Handling goal submit');

        const goal = {
            id: `goal${Date.now()}`,
            name: document.getElementById('goal-name').value,
            targetAmount: parseFloat(document.getElementById('goal-amount').value),
            currentAmount: 0,
            targetDate: document.getElementById('goal-date').value,
            category: document.getElementById('goal-category').value,
            monthlyContribution: parseFloat(document.getElementById('goal-contribution').value || 0),
            notes: document.getElementById('goal-notes').value || '',
            active: true
        };

        console.log('New goal data:', goal);

        // Add new goal
        this.data.goals.push(goal);
        localStorage.setItem('goals', JSON.stringify(this.data.goals));
        this.resetForm();
        this.loadGoals();
        
        // Update view goals screen if it's visible
        if (document.getElementById('view-goals-screen').classList.contains('active')) {
            this.renderViewGoals();
        }
        
        this.updateViewGoalsButtonState();
        showToast('Goal created successfully!', 'success');
    },

    resetForm() {
        const form = document.querySelector('#set-goal-screen .goal-form');
        if (form) {
            form.reset();
        }
    },

    showAddFundsModal(goalId) {
        const goal = this.data.goals.find(g => g.id === goalId);
        if (!goal) return;

        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="add-funds-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Funds to ${goal.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <form class="add-funds-form">
                        <div class="form-group">
                            <label for="amount">Amount to Add</label>
                            <div class="amount-input-wrapper">
                                <span class="currency-symbol">$</span>
                                <input type="number" id="amount" name="amount" min="0" step="0.01" required class="form-input">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">Add Funds</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('add-funds-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = modal.querySelector('form');

        // Close modal when clicking close button or outside modal
        closeBtn.addEventListener('click', () => this.closeAddFundsModal());
        cancelBtn.addEventListener('click', () => this.closeAddFundsModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeAddFundsModal();
        });

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(form.amount.value);
            if (isNaN(amount) || amount <= 0) return;

            goal.currentAmount += amount;
            localStorage.setItem('goals', JSON.stringify(this.data.goals));
            this.loadGoals();
            
            // Update view goals screen if it's visible
            if (document.getElementById('view-goals-screen').classList.contains('active')) {
                this.renderViewGoals();
            }
            
            showToast(`Added $${amount.toFixed(2)} to ${goal.name}`, 'success');
            this.closeAddFundsModal();
        });
    },

    closeAddFundsModal() {
        const modal = document.getElementById('add-funds-modal');
        if (modal) {
            modal.remove();
        }
    },

    deleteGoal(goalId) {
        const goalIndex = this.data.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const deletedGoal = this.data.goals[goalIndex];
        
        // Actually remove the goal from the array instead of just marking it inactive
        this.data.goals.splice(goalIndex, 1);
        localStorage.setItem('goals', JSON.stringify(this.data.goals));

        console.log(`Goal ${goalId} deleted. Goals remaining:`, this.data.goals.filter(g => g.active).length);

        showToast(
            'Goal deleted',
            'success',
            'Undo',
            () => {
                // Restore the goal by adding it back to the array
                this.data.goals.push(deletedGoal);
                localStorage.setItem('goals', JSON.stringify(this.data.goals));
                this.loadGoals();
                
                // Update view goals screen if it's visible
                if (document.getElementById('view-goals-screen').classList.contains('active')) {
                    this.renderViewGoals();
                }
                
                this.updateViewGoalsButtonState();
                showToast('Goal restored');
            }
        );

        this.loadGoals();
        
        // Update view goals screen if it's visible
        if (document.getElementById('view-goals-screen').classList.contains('active')) {
            this.renderViewGoals();
        }
        
        this.updateViewGoalsButtonState();
    },

    navigateToViewGoalsScreen() {
        document.getElementById('set-goal-screen').classList.remove('active');
        document.getElementById('view-goals-screen').classList.add('active');
        
        // Explicitly render goals in the view screen
        this.renderViewGoals();
        this.updateGoalStats();
        console.log('Navigated to view goals screen with', this.data.goals.filter(goal => goal.active === true).length, 'active goals');
    },

    renderViewGoals() {
        // Always render goals in the view-goals-screen
        const viewGoalsList = document.querySelector('#view-goals-screen .goals-list');
        if (!viewGoalsList) return;
        
        // Fix potentially corrupted goals data
        this.validateGoalsData();
        
        // Show all goals without filtering for active status
        console.log('Rendering view goals:', this.data.goals.length, 'goals');
        
        if (this.data.goals.length === 0) {
            viewGoalsList.innerHTML = `
                <div class="empty-state">
                    <p>You don't have any goals yet.</p>
                    <p>Use the form to create your first financial goal!</p>
                </div>
            `;
        } else {
            try {
                viewGoalsList.innerHTML = this.data.goals
                    .map(goal => this.createGoalHTML(goal))
                    .join('');
            } catch (error) {
                console.error('Error rendering goals:', error);
                viewGoalsList.innerHTML = `
                    <div class="empty-state">
                        <p>There was an error displaying your goals.</p>
                        <p>Please try refreshing the page.</p>
                    </div>
                `;
                // Try to repair goals data
                this.repairGoalsData();
            }
        }
    },

    clearAllGoals() {
        // Clear all goals
        this.data.goals = [];
        localStorage.setItem('goals', JSON.stringify([]));
        this.loadGoals();
        
        // Update view goals screen if it's visible
        if (document.getElementById('view-goals-screen').classList.contains('active')) {
            this.renderViewGoals();
        }
        
        this.updateViewGoalsButtonState();
        showToast('All goals have been cleared', 'info');
    }
};

export default GoalsManager; 