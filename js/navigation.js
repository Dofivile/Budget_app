// Navigation functionality

// Reports page navigation
function initializeReportsNavigation() {
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
}

// Screen Navigation
function showBudgetScreen(screenId) {
    const screens = document.querySelectorAll('.manage-budget-screen');
    screens.forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Tab Navigation
function initializeTabNavigation() {
    // Get all nav items and tab contents
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

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

            // Initialize GoalsManager when savings tab is shown
            if (tabText === 'savings') {
                console.log('Initializing GoalsManager for savings tab');
                window.GoalsManager?.init();
            }
        });
    });
}

// No export statement - functions are now globally available 