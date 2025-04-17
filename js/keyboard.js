/**
 * Virtual Keyboard Module
 * Displays an on-screen keyboard when text inputs are focused
 */

class VirtualKeyboard {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: document.querySelector('.phone-frame') || document.body,
            theme: 'default',
            layout: 'standard',
            autoOpen: true,
            specialKeys: true,
            ...options
        };
        
        // Keyboard state
        this.isOpen = false;
        this.activeInput = null;
        this.caps = false;
        this.shift = false;
        
        // Create keyboard elements
        this.keyboardElement = null;
        this.keysContainer = null;
        
        // Initialize the keyboard
        this.init();
        
        // Watch for dark mode changes
        this.observeDarkModeChanges();
    }
    
    /**
     * Initialize the keyboard
     */
    init() {
        // Create keyboard DOM element
        this.createKeyboardDOM();
        
        // Add event listeners for input fields
        this.addInputListeners();
        
        // Add event listener for window resize
        window.addEventListener('resize', () => {
            if (this.isOpen) {
                this.positionKeyboard();
            }
        });
        
        // Listen for theme changes and update keyboard accordingly
        document.addEventListener('themeChanged', (e) => {
            console.log('Keyboard detected theme change:', e.detail);
            this.updateThemeFromBodyClass();
        });
        
        // Initial theme setup
        this.updateThemeFromBodyClass();
    }
    
    /**
     * Watch for theme changes in the document
     */
    observeDarkModeChanges() {
        // Check for theme settings initially
        this.updateThemeFromBodyClass();
        
        // Create observers to watch for theme-related changes
        const bodyObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'data-text-size' || 
                    mutation.attributeName === 'data-contrast') {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                this.updateThemeFromBodyClass();
            }
        });
        
        const htmlObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-text-size' || 
                    mutation.attributeName === 'data-contrast' ||
                    mutation.attributeName === 'data-theme') {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                this.updateThemeFromBodyClass();
            }
        });
        
        // Watch for attribute changes on both body and html elements
        bodyObserver.observe(document.body, { 
            attributes: true,
            attributeFilter: ['class', 'data-text-size', 'data-contrast', 'data-theme']
        });
        
        htmlObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-text-size', 'data-contrast', 'data-theme']
        });
        
        // Also listen for theme change events
        document.addEventListener('themeChanged', () => {
            this.updateThemeFromBodyClass();
        });
    }
    
    /**
     * Update keyboard theme based on body class
     */
    updateThemeFromBodyClass() {
        // Check for both class and attribute methods of dark mode
        const isDarkMode = document.body.classList.contains('dark-mode') || 
                           document.documentElement.getAttribute('data-theme') === 'dark' ||
                           document.querySelector('.phone-frame')?.getAttribute('data-theme') === 'dark';
        
        // Check for high contrast mode
        const isHighContrast = document.body.classList.contains('high-contrast') ||
                               document.documentElement.getAttribute('data-contrast') === 'high';
        
        // Check for text size
        const textSize = document.body.getAttribute('data-text-size') || 
                        document.documentElement.getAttribute('data-text-size') || 
                        document.querySelector('.phone-frame')?.getAttribute('data-text-size') ||
                        'medium';
        
        // Get text size class from body if available
        const textSizeClass = Array.from(document.body.classList)
            .find(cls => cls.startsWith('text-')) || `text-${textSize}`;
        
        if (this.keyboardElement) {
            // Apply dark mode
            if (isDarkMode) {
                this.keyboardElement.classList.add('dark-theme');
                this.keyboardElement.classList.remove('light-theme');
            } else {
                this.keyboardElement.classList.remove('dark-theme');
                this.keyboardElement.classList.add('light-theme');
            }
            
            // Apply high contrast if needed
            this.keyboardElement.classList.toggle('high-contrast', isHighContrast);
            
            // Apply text size from document
            this.keyboardElement.setAttribute('data-text-size', textSize);
            
            // Apply text size classes
            this.keyboardElement.classList.remove('text-small', 'text-medium', 'text-large');
            this.keyboardElement.classList.add(textSizeClass);
            
            // Update key sizes based on text size
            this.updateKeySizes(textSize);
        }
        
        this.options.theme = isDarkMode ? 'dark-theme' : 'light-theme';
    }
    
    /**
     * Create the keyboard DOM element
     */
    createKeyboardDOM() {
        // Create the main keyboard container
        this.keyboardElement = document.createElement('div');
        this.keyboardElement.className = `virtual-keyboard ${this.options.theme}`;
        this.keyboardElement.setAttribute('id', 'virtual-keyboard');
        this.keyboardElement.style.display = 'none';
        
        // Add dark-keyboard class if app is in dark mode
        if (document.body.classList.contains('dark-mode')) {
            this.keyboardElement.classList.add('dark-keyboard');
        }
        
        // Create the keys container
        this.keysContainer = document.createElement('div');
        this.keysContainer.className = 'keyboard-keys';
        
        // Add keys to the container
        this.keysContainer.appendChild(this.createKeys());
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.className = 'keyboard-close-btn';
        closeButton.innerHTML = '✕';
        closeButton.addEventListener('click', () => this.close());
        this.keyboardElement.appendChild(closeButton);
        
        // Add the keys container to the keyboard
        this.keyboardElement.appendChild(this.keysContainer);
        
        // Add to DOM
        this.options.container.appendChild(this.keyboardElement);
    }
    
    /**
     * Create the keyboard keys
     */
    createKeys() {
        const fragment = document.createDocumentFragment();
        
        // Define keyboard layout
        const keyLayout = this.getKeyLayout();
        
        // Create HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<span class="material-icons">${icon_name}</span>`;
        };
        
        // Loop through each key and create button
        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertBreak = key.includes('|');
            
            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard-key");
            
            if (insertBreak) {
                fragment.appendChild(document.createElement("br"));
                return;
            }
            
            // Set a data attribute for the key
            keyElement.setAttribute('data-key', key);
            
            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard-key-wide");
                    keyElement.innerHTML = '⌫';
                    keyElement.addEventListener("click", () => {
                        this.handleBackspace();
                    });
                    break;
                
                case "caps":
                    keyElement.classList.add("keyboard-key-wide", "keyboard-key-activatable");
                    keyElement.innerHTML = '⇪';
                    keyElement.addEventListener("click", () => {
                        this.handleCapsLock();
                        keyElement.classList.toggle("keyboard-key-active", this.caps);
                    });
                    break;
                
                case "enter":
                    keyElement.classList.add("keyboard-key-wide");
                    keyElement.innerHTML = '↵';
                    keyElement.addEventListener("click", () => {
                        this.handleEnter();
                    });
                    break;
                
                case "space":
                    keyElement.classList.add("keyboard-key-extra-wide");
                    keyElement.innerHTML = ' ';
                    keyElement.addEventListener("click", () => {
                        this.handleKey(' ');
                    });
                    break;
                
                case "shift":
                    keyElement.classList.add("keyboard-key-wide", "keyboard-key-activatable");
                    keyElement.innerHTML = '⇧';
                    keyElement.addEventListener("click", () => {
                        this.handleShift();
                        keyElement.classList.toggle("keyboard-key-active", this.shift);
                    });
                    break;
                
                case "done":
                    keyElement.classList.add("keyboard-key-wide", "keyboard-key-dark");
                    keyElement.innerHTML = 'Done';
                    keyElement.addEventListener("click", () => {
                        this.close();
                        this.activeInput?.blur();
                    });
                    break;
                
                default:
                    keyElement.textContent = key.toLowerCase();
                    keyElement.addEventListener("click", () => {
                        // Handle normal key press
                        this.handleKey(this.caps || this.shift ? key.toUpperCase() : key.toLowerCase());
                        
                        // If shift is active, turn it off after a key press
                        if (this.shift) {
                            this.shift = false;
                            document.querySelector('.keyboard-key[data-key="shift"]')?.classList.remove('keyboard-key-active');
                        }
                    });
                    break;
            }
            
            // Add touch events for better mobile experience
            this.addTouchEvents(keyElement);
            
            // Add key to fragment
            fragment.appendChild(keyElement);
        });
        
        return fragment;
    }
    
    /**
     * Add touch events to a key element
     */
    addTouchEvents(keyElement) {
        // Add hover effect on touch start
        keyElement.addEventListener('touchstart', e => {
            e.preventDefault(); // Prevent default touch behavior
            keyElement.classList.add('keyboard-key-hover');
        });
        
        // Remove hover effect on touch end/cancel
        keyElement.addEventListener('touchend', e => {
            e.preventDefault();
            keyElement.classList.remove('keyboard-key-hover');
        });
        
        keyElement.addEventListener('touchcancel', e => {
            e.preventDefault();
            keyElement.classList.remove('keyboard-key-hover');
        });
    }
    
    /**
     * Get the keyboard layout based on the specified option
     */
    getKeyLayout() {
        // Standard QWERTY layout
        if (this.options.layout === 'standard') {
            return [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "|",
                "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "|",
                "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter", "|",
                "caps", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?", "|",
                "shift", "space", "done"
            ];
        }
        
        // Numeric layout for amount/numeric inputs
        if (this.options.layout === 'numeric') {
            return [
                "1", "2", "3", "|",
                "4", "5", "6", "|",
                "7", "8", "9", "|",
                ".", "0", "backspace", "|",
                "done"
            ];
        }
        
        // Default to standard layout
        return this.getKeyLayout('standard');
    }
    
    /**
     * Add event listeners to text inputs
     */
    addInputListeners() {
        // Get all input fields
        const inputFields = document.querySelectorAll('input[type="text"], input[type="search"], textarea, input[type="email"], input[type="number"]');
        
        // Add focus event listener to each input
        inputFields.forEach(input => {
            input.addEventListener('focus', () => {
                // Switch to numeric keyboard if it's a number input
                if (input.type === 'number' || input.inputmode === 'numeric' || input.inputmode === 'decimal') {
                    this.options.layout = 'numeric';
                    this.rebuildKeyboard();
                } else {
                    this.options.layout = 'standard';
                    this.rebuildKeyboard();
                }
                
                // Set active input and open keyboard
                this.activeInput = input;
                if (this.options.autoOpen) {
                    this.open();
                }
            });
        });
        
        // Listen for new input elements that might be added to the DOM
        this.observeDynamicInputs();
    }
    
    /**
     * Observer for dynamically added input fields
     */
    observeDynamicInputs() {
        // Create an observer instance
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // If the added node is an input field, add listeners
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('input[type="text"], input[type="search"], textarea, input[type="email"], input[type="number"]')) {
                                this.addInputListener(node);
                            } else {
                                // Check for inputs inside the added node
                                const inputs = node.querySelectorAll('input[type="text"], input[type="search"], textarea, input[type="email"], input[type="number"]');
                                inputs.forEach(input => this.addInputListener(input));
                            }
                        }
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Add listener to a single input field
     */
    addInputListener(input) {
        input.addEventListener('focus', () => {
            // Switch to numeric keyboard if it's a number input
            if (input.type === 'number' || input.inputmode === 'numeric' || input.inputmode === 'decimal') {
                this.options.layout = 'numeric';
                this.rebuildKeyboard();
            } else {
                this.options.layout = 'standard';
                this.rebuildKeyboard();
            }
            
            // Set active input and open keyboard
            this.activeInput = input;
            if (this.options.autoOpen) {
                this.open();
            }
        });
    }
    
    /**
     * Rebuild the keyboard (e.g., when switching layouts)
     */
    rebuildKeyboard() {
        // Remove existing keys
        this.keysContainer.innerHTML = '';
        
        // Create new keys
        this.keysContainer.appendChild(this.createKeys());
    }
    
    /**
     * Handle key press
     */
    handleKey(key) {
        if (!this.activeInput) return;
        
        // Get current cursor position
        const startPos = this.activeInput.selectionStart;
        const endPos = this.activeInput.selectionEnd;
        
        // Get the current value
        const value = this.activeInput.value;
        
        // Insert the key at cursor position
        this.activeInput.value = value.substring(0, startPos) + key + value.substring(endPos);
        
        // Move cursor position after the inserted key
        this.activeInput.selectionStart = this.activeInput.selectionEnd = startPos + key.length;
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        this.activeInput.dispatchEvent(event);
        
        // Focus back on the input
        this.activeInput.focus();
    }
    
    /**
     * Handle backspace key
     */
    handleBackspace() {
        if (!this.activeInput) return;
        
        // Get current cursor position
        const startPos = this.activeInput.selectionStart;
        const endPos = this.activeInput.selectionEnd;
        
        // Get the current value
        const value = this.activeInput.value;
        
        // If there's a selection, delete the selection
        if (endPos > startPos) {
            this.activeInput.value = value.substring(0, startPos) + value.substring(endPos);
            this.activeInput.selectionStart = this.activeInput.selectionEnd = startPos;
        } else if (startPos > 0) {
            // Otherwise delete the character before cursor
            this.activeInput.value = value.substring(0, startPos - 1) + value.substring(startPos);
            this.activeInput.selectionStart = this.activeInput.selectionEnd = startPos - 1;
        }
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        this.activeInput.dispatchEvent(event);
        
        // Focus back on the input
        this.activeInput.focus();
    }
    
    /**
     * Handle enter key
     */
    handleEnter() {
        if (!this.activeInput) return;
        
        // If textarea, insert a new line
        if (this.activeInput.tagName.toLowerCase() === 'textarea') {
            this.handleKey('\n');
        } else {
            // For other inputs, submit the form or blur the input
            const form = this.activeInput.closest('form');
            if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            } else {
                this.activeInput.blur();
                this.close();
            }
        }
    }
    
    /**
     * Handle caps lock key
     */
    handleCapsLock() {
        this.caps = !this.caps;
        
        // Update key display
        const keys = this.keysContainer.querySelectorAll('.keyboard-key:not(.keyboard-key-wide):not(.keyboard-key-extra-wide)');
        keys.forEach(key => {
            if (key.textContent.length === 1) {
                key.textContent = this.caps ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        });
    }
    
    /**
     * Handle shift key
     */
    handleShift() {
        this.shift = !this.shift;
        
        // Update key display
        const keys = this.keysContainer.querySelectorAll('.keyboard-key:not(.keyboard-key-wide):not(.keyboard-key-extra-wide)');
        keys.forEach(key => {
            if (key.textContent.length === 1) {
                key.textContent = this.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        });
    }
    
    /**
     * Open the keyboard
     */
    open() {
        // Return if already open
        if (this.isOpen) return;
        
        // Show keyboard
        this.keyboardElement.style.display = 'block';
        this.isOpen = true;
        
        // Position the keyboard
        this.positionKeyboard();
    }
    
    /**
     * Close the keyboard
     */
    close() {
        if (!this.isOpen) return;
        
        // Hide keyboard
        this.keyboardElement.style.display = 'none';
        this.isOpen = false;
        
        // Reset app content padding
        const appContent = document.querySelector('.app-content');
        if (appContent) {
            appContent.style.paddingBottom = '';
        }
    }
    
    /**
     * Position the keyboard appropriately on screen
     */
    positionKeyboard() {
        // Calculate where to position the keyboard
        const phoneFrame = document.querySelector('.phone-frame');
        const appContent = document.querySelector('.app-content');
        const keyboardHeight = this.keyboardElement.offsetHeight;
        
        // Position at the bottom of the app content
        this.keyboardElement.style.position = 'absolute';
        this.keyboardElement.style.bottom = '0';
        this.keyboardElement.style.left = '0';
        this.keyboardElement.style.width = '100%';
        this.keyboardElement.style.zIndex = '1000';
        
        // Adjust the app content padding to make room for the keyboard
        if (appContent) {
            appContent.style.paddingBottom = `${keyboardHeight}px`;
        }
        
        // Scroll to ensure the active input is visible
        if (this.activeInput) {
            const phoneFrameRect = phoneFrame ? phoneFrame.getBoundingClientRect() : { top: 0, height: window.innerHeight };
            const inputRect = this.activeInput.getBoundingClientRect();
            const inputTop = inputRect.top - phoneFrameRect.top;
            const inputBottom = inputRect.bottom - phoneFrameRect.top;
            const visibleHeight = phoneFrameRect.height - keyboardHeight;
            
            // If input is hidden by the keyboard, scroll it into view
            if (inputBottom > visibleHeight) {
                const scrollParent = appContent || window;
                const scrollAmount = inputBottom - visibleHeight + 20; // 20px extra padding
                
                if (appContent) {
                    appContent.scrollBy({
                        top: scrollAmount,
                        behavior: 'smooth'
                    });
                } else {
                    window.scrollBy({
                        top: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }
    
    /**
     * Update key sizes based on text size setting
     */
    updateKeySizes(textSize) {
        if (!this.keyboardElement) return;
        
        const keys = this.keyboardElement.querySelectorAll('.keyboard-key');
        
        // Set base sizes
        let keyHeight = 38;
        let keyWidth = 30;
        let wideKeyWidth = 50;
        let extraWideKeyWidth = 100;
        let fontSize = 13;
        
        // Adjust based on text size
        if (textSize === 'small') {
            keyHeight = 32;
            keyWidth = 25;
            wideKeyWidth = 42;
            extraWideKeyWidth = 85;
            fontSize = 11;
        } else if (textSize === 'large') {
            keyHeight = 45;
            keyWidth = 35;
            wideKeyWidth = 60;
            extraWideKeyWidth = 120;
            fontSize = 15;
        }
        
        // Apply sizes to all keys
        keys.forEach(key => {
            key.style.height = `${keyHeight}px`;
            key.style.minWidth = `${keyWidth}px`;
            key.style.fontSize = `${fontSize}px`;
            
            if (key.classList.contains('keyboard-key-wide')) {
                key.style.minWidth = `${wideKeyWidth}px`;
            } else if (key.classList.contains('keyboard-key-extra-wide')) {
                key.style.minWidth = `${extraWideKeyWidth}px`;
            }
        });
        
        // Position keyboard to adjust for size changes
        if (this.isOpen) {
            this.positionKeyboard();
        }
    }
} 