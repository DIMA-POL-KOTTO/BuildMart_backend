class AuthManager {
    constructor() {
        this.isLoading = false;
        this.currentForm = 'login';
        
        this.initElements();
        this.bindEvents();
        this.init();
    }
    
    initElements() {
        // Tabs
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        
        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginFormElement = document.getElementById('loginFormElement');
        this.registerFormElement = document.getElementById('registerFormElement');
        
        // Login inputs
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        
        // Register inputs
        this.registerEmail = document.getElementById('registerEmail');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
        
        // Submit buttons
        this.loginSubmit = document.getElementById('loginSubmit');
        this.registerSubmit = document.getElementById('registerSubmit');
        
        // Error/success messages
        this.apiError = document.getElementById('apiError');
        this.successMessage = document.getElementById('successMessage');
        
        // Loading
        this.loading = document.getElementById('loading');
        
        // Error elements
        this.loginEmailError = document.getElementById('loginEmailError');
        this.loginPasswordError = document.getElementById('loginPasswordError');
        this.registerEmailError = document.getElementById('registerEmailError');
        this.registerPasswordError = document.getElementById('registerPasswordError');
        this.registerPasswordConfirmError = document.getElementById('registerPasswordConfirmError');
    }
    
    bindEvents() {
        // Tab switching
        this.loginTab.addEventListener('click', () => this.switchForm('login'));
        this.registerTab.addEventListener('click', () => this.switchForm('register'));
        
        // Form submissions
        this.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Input validation
        this.loginEmail.addEventListener('blur', () => this.validateEmail(this.loginEmail, this.loginEmailError));
        this.registerEmail.addEventListener('blur', () => this.validateEmail(this.registerEmail, this.registerEmailError));
        this.registerPassword.addEventListener('blur', () => this.validatePassword(this.registerPassword, this.registerPasswordError));
        this.registerPasswordConfirm.addEventListener('blur', () => this.validatePasswordConfirm());
    }
    
    init() {
        // Check if user is already logged in
        const token = this.getToken();
        if (token) {
            // Redirect to home page if already logged in
            window.location.href = 'index.html';
        }
    }
    
    switchForm(formType) {
        if (this.isLoading) return;
        
        this.currentForm = formType;
        
        // Update tabs
        this.loginTab.classList.toggle('active', formType === 'login');
        this.registerTab.classList.toggle('active', formType === 'register');
        
        // Update forms
        this.loginForm.classList.toggle('active', formType === 'login');
        this.registerForm.classList.toggle('active', formType === 'register');
        
        // Clear messages
        this.clearMessages();
        this.clearErrors();
    }
    
    validateEmail(input, errorElement) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError(errorElement, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError(errorElement, 'Please enter a valid email address');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    }
    
    validatePassword(input, errorElement) {
        const password = input.value;
        
        if (!password) {
            this.showError(errorElement, 'Password is required');
            return false;
        }
        
        if (password.length < 8) {
            this.showError(errorElement, 'Password must be at least 8 characters');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    }
    
    validatePasswordConfirm() {
        const password = this.registerPassword.value;
        const confirmPassword = this.registerPasswordConfirm.value;
        
        if (!confirmPassword) {
            this.showError(this.registerPasswordConfirmError, 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError(this.registerPasswordConfirmError, 'Passwords do not match');
            return false;
        }
        
        this.hideError(this.registerPasswordConfirmError);
        return true;
    }
    
    showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }
    
    hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }
    
    clearErrors() {
        this.hideError(this.loginEmailError);
        this.hideError(this.loginPasswordError);
        this.hideError(this.registerEmailError);
        this.hideError(this.registerPasswordError);
        this.hideError(this.registerPasswordConfirmError);
    }
    
    showApiError(message) {
        this.apiError.textContent = message;
        this.apiError.classList.add('show');
    }
    
    hideApiError() {
        this.apiError.textContent = '';
        this.apiError.classList.remove('show');
    }
    
    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.classList.add('show');
    }
    
    hideSuccess() {
        this.successMessage.textContent = '';
        this.successMessage.classList.remove('show');
    }
    
    showLoading() {
        this.isLoading = true;
        this.loading.classList.add('show');
        this.loginSubmit.disabled = true;
        this.registerSubmit.disabled = true;
    }
    
    hideLoading() {
        this.isLoading = false;
        this.loading.classList.remove('show');
        this.loginSubmit.disabled = false;
        this.registerSubmit.disabled = false;
    }
    
    clearMessages() {
        this.hideApiError();
        this.hideSuccess();
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        // Validate inputs
        const isEmailValid = this.validateEmail(this.loginEmail, this.loginEmailError);
        const isPasswordValid = this.validatePassword(this.loginPassword, this.loginPasswordError);
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        this.showLoading();
        this.clearMessages();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.loginEmail.value.trim(),
                    password: this.loginPassword.value
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Save token
            this.saveToken(data.token);
            
            // Update auth header state
            updateAuthHeader();
            
            // Show success message
            this.showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            this.showApiError(error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        // Validate inputs
        const isEmailValid = this.validateEmail(this.registerEmail, this.registerEmailError);
        const isPasswordValid = this.validatePassword(this.registerPassword, this.registerPasswordError);
        const isPasswordConfirmValid = this.validatePasswordConfirm();
        
        if (!isEmailValid || !isPasswordValid || !isPasswordConfirmValid) {
            return;
        }
        
        this.showLoading();
        this.clearMessages();
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.registerEmail.value.trim(),
                    password: this.registerPassword.value
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Show success message and switch to login form
            this.showSuccess('Registration successful! Please sign in.');
            
            // Clear register form
            this.registerFormElement.reset();
            this.clearErrors();
            
            // Switch to login form after a delay
            setTimeout(() => {
                this.switchForm('login');
                // Auto-fill email in login form
                this.loginEmail.value = this.registerEmail.value;
            }, 2000);
            
        } catch (error) {
            this.showApiError(error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    saveToken(token) {
        // Save token to sessionStorage as per requirements
        sessionStorage.setItem('token', token);
    }
    
    getToken() {
        return sessionStorage.getItem('token');
    }
    
    clearToken() {
        sessionStorage.removeItem('token');
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});


/**
 * Функция для обновления состояния аутентификации в шапке
 * Вызывается после успешного входа для обновления интерфейса
 */
function updateAuthHeader() {
    if (typeof updateAuthState !== 'undefined') {
        updateAuthState();
    } else if (window.authUI) {
        window.authUI.init();
    }
}

// Экспортируем функции для доступа из других скриптов
window.updateAuthHeader = updateAuthHeader;