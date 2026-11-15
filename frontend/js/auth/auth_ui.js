class AuthUI {
    constructor() {
        this.token = null;
        this.user = null;
        this.initElements();
        this.init();
    }
    
    initElements() {
        this.authHeader = document.getElementById('authHeader');
        if (!this.authHeader) {
            this.createAuthHeader();
        }
    }

    createAuthHeader() {
        const headerContent = document.querySelector('.header-content');
        if (!headerContent) {
            console.warn('Header content container not found');
            return;
        }

        this.authHeader = document.createElement('div');
        this.authHeader.className = 'auth-header';
        this.authHeader.id = 'authHeader';

        const cartButton = headerContent.querySelector('.cart');
        if (cartButton) {
            headerContent.insertBefore(this.authHeader, cartButton);
        } else {
            headerContent.appendChild(this.authHeader);
        }
    }
    
    async init() {
        this.token = this.getToken();
        this.user = null;

        if (this.token) {
            const userLoaded = await this.loadUser();
            if (userLoaded) {
                this.renderLoggedIn();
            } else {
                this.clearToken();
                this.renderGuest();
            }
        } else {
            this.renderGuest();
        }

        this.dispatchAuthChanged();
    }

    getToken() {
        return sessionStorage.getItem('token');
    }
    
    async loadUser() {
        if (!this.token) return false;
        
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                return true;
            } else if (response.status === 401) {
                console.log('Token is invalid or expired, clearing...');
                return false;
            } else {
                console.error('Failed to load user, status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            return false;
        }
    }
    
    renderGuest() {
        if (!this.authHeader) return;
        
        this.authHeader.innerHTML = `
            <a href="auth.html" class="auth-btn">
                <i class="fa-solid fa-sign-in-alt"></i>
                <span>Sign In</span>
            </a>
        `;
        
        const signInBtn = this.authHeader.querySelector('.auth-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'auth.html';
            });
        }
    }

    renderLoggedIn() {
        if (!this.authHeader || !this.user) return;
        
        const userEmail = this.user.email || 'User';
        
        this.authHeader.innerHTML = `
            <div class="user-dropdown">
                <button class="user-btn" aria-expanded="false" aria-haspopup="true">
                    <i class="fa-solid fa-user-circle"></i>
                    <span class="user-email" title="${userEmail}">${userEmail}</span>
                    <i class="fa-solid fa-caret-down"></i>
                </button>
                <div class="dropdown-content" role="menu">
                    <button class="dropdown-item logout-btn" role="menuitem">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;
        
        const userBtn = this.authHeader.querySelector('.user-btn');
        const logoutBtn = this.authHeader.querySelector('.logout-btn');
        
        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        document.addEventListener('click', () => {
            this.closeDropdown();
        });
    }
    
    toggleDropdown() {
        if (!this.authHeader) return;
        
        const dropdown = this.authHeader.querySelector('.dropdown-content');
        const userBtn = this.authHeader.querySelector('.user-btn');
        
        if (dropdown && userBtn) {
            const isExpanded = dropdown.classList.toggle('show');
            userBtn.setAttribute('aria-expanded', isExpanded.toString());
        }
    }

    closeDropdown() {
        if (!this.authHeader) return;
        
        const dropdown = this.authHeader.querySelector('.dropdown-content');
        const userBtn = this.authHeader.querySelector('.user-btn');
        
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        
        if (userBtn) {
            userBtn.setAttribute('aria-expanded', 'false');
        }
    }
    
    handleLogout() {
        this.clearToken();
        this.user = null;

        this.renderGuest();
        this.closeDropdown();

        this.dispatchAuthChanged();

        console.log('User logged out successfully');
    }
    
    clearToken() {
        sessionStorage.removeItem('token');
        this.token = null;
    }

    dispatchAuthChanged() {
        document.dispatchEvent(new CustomEvent('auth:changed', {
            detail: {
                user: this.user,
                token: this.token
            }
        }));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authUI = new AuthUI();

    window.authUI = authUI;
});

function updateAuthState() {
    if (window.authUI) {
        window.authUI.init();
    }
}