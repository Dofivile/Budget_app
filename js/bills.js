// Bills Management

import { formatCurrency } from './utils.js';
import { settings } from './settings.js';
import { showToast } from './utils.js';

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

export default BillsManager; 