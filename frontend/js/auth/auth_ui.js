/**
 * AuthUI - управление состоянием аутентификации в шапке сайта
 * Второй пункт ТЗ: отображение состояния пользователя в шапке сайта
 */

class AuthUI {
    constructor() {
        this.token = null;
        this.user = null;
        this.initElements();
        this.init();
    }
    
    /**
     * Инициализация DOM элементов
     */
    initElements() {
        // Поиск контейнера для аутентификации в шапке
        this.authHeader = document.getElementById('authHeader');
        
        // Если контейнер не найден, создаем его
        if (!this.authHeader) {
            this.createAuthHeader();
        }
    }
    
    /**
     * Создание контейнера для аутентификации в шапке
     */
    createAuthHeader() {
        const headerContent = document.querySelector('.header-content');
        if (!headerContent) {
            console.warn('Header content container not found');
            return;
        }
        
        // Создаем контейнер для аутентификации
        this.authHeader = document.createElement('div');
        this.authHeader.className = 'auth-header';
        this.authHeader.id = 'authHeader';
        
        // Вставляем контейнер перед кнопкой корзины или в конце
        const cartButton = headerContent.querySelector('.cart');
        if (cartButton) {
            headerContent.insertBefore(this.authHeader, cartButton);
        } else {
            headerContent.appendChild(this.authHeader);
        }
    }
    
    /**
     * Основная инициализация
     */
    async init() {
        this.token = this.getToken();
        
        if (this.token) {
            const userLoaded = await this.loadUser();
            if (userLoaded) {
                this.renderLoggedIn();
            } else {
                // Токен недействительный, очищаем и показываем гостя
                this.clearToken();
                this.renderGuest();
            }
        } else {
            this.renderGuest();
        }
    }
    
    /**
     * Получение токена из sessionStorage
     */
    getToken() {
        return sessionStorage.getItem('token');
    }
    
    /**
     * Загрузка данных пользователя по токену через /api/auth/me
     * @returns {boolean} Успешна ли загрузка
     */
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
                // Токен недействителен или истек
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
    
    /**
     * Рендеринг состояния "Гость"
     */
    renderGuest() {
        if (!this.authHeader) return;
        
        this.authHeader.innerHTML = `
            <a href="auth.html" class="auth-btn">
                <i class="fa-solid fa-sign-in-alt"></i>
                <span>Sign In</span>
            </a>
        `;
        
        // Обработчик клика для кнопки входа
        const signInBtn = this.authHeader.querySelector('.auth-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'auth.html';
            });
        }
    }
    
    /**
     * Рендеринг состояния "Авторизованный пользователь"
     */
    renderLoggedIn() {
        if (!this.authHeader || !this.user) return;
        
        // Отображаем email пользователя
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
        
        // Добавляем обработчики событий
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
        
        // Закрытие выпадающего меню при клике вне его
        document.addEventListener('click', () => {
            this.closeDropdown();
        });
    }
    
    /**
     * Переключение видимости выпадающего меню
     */
    toggleDropdown() {
        if (!this.authHeader) return;
        
        const dropdown = this.authHeader.querySelector('.dropdown-content');
        const userBtn = this.authHeader.querySelector('.user-btn');
        
        if (dropdown && userBtn) {
            const isExpanded = dropdown.classList.toggle('show');
            userBtn.setAttribute('aria-expanded', isExpanded.toString());
        }
    }
    
    /**
     * Закрытие выпадающего меню
     */
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
    
    /**
     * Обработка выхода пользователя
     */
    handleLogout() {
        // Удаляем токен из sessionStorage
        this.clearToken();
        this.user = null;
        
        // Обновляем интерфейс
        this.renderGuest();
        this.closeDropdown();
        
        console.log('User logged out successfully');
    }
    
    /**
     * Очистка токена
     */
    clearToken() {
        sessionStorage.removeItem('token');
        this.token = null;
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const authUI = new AuthUI();
    
    // Экспортируем объект для возможности ручного обновления
    window.authUI = authUI;
});

/**
 * Вспомогательная функция для обновления состояния аутентификации
 * (например, после успешного входа на странице auth.html)
 */
function updateAuthState() {
    if (window.authUI) {
        window.authUI.init();
    }
}