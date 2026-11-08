# ТЗ №2: админ-управление товарами в каталоге (только фронтенд)

## Протокол работы (по требованию пользователя)
- Код пишу в стиле проекта (4 пробела, глобальные скрипты, kebab-case классы, идиома `.show`) и **без комментариев в коде**.
- Строго по шагам: сделал шаг → остановился → дал инструкцию как проверить → жду одобрения → следующий шаг.

## Контекст

Проект: BuildMart — ванильный многостраничный фронт (`frontend/`, глобальные скрипты без модулей) + Express/Prisma/MariaDB в Docker, фронт раздаётся бэкендом на `http://localhost:8080`.

**Что уже реализовано:**
- Бэк готов полностью: `GET /api/auth/me` возвращает `{ user: { id, email, role, createdAt } }`; `POST /api/products`, `PUT/DELETE /api/products/:id` существуют и защищены `authMiddleware, roleMiddleware("admin")`. **Правки бэкенда не нужны.**
- Фронт: авторизация есть (токен в `sessionStorage['token']`), админ-UI отсутствует полностью.

Квирки бэка, учитываемые на фронте: POST требует все 6 полей; `price` приходит строкой; изображения — массив URL-строк (без загрузки файлов); JWT живёт 1ч.

## Шаги

**Шаг 1. `frontend/js/auth/auth_ui.js`** — в конце `init()` (все ветки) и в `handleLogout()` диспатч `document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user, token } }))` через новый метод `dispatchAuthChanged()`. Роль отрабатывает асинхронно после рендера каталога — событие «доставит» её админ-модулю.

**Шаг 2. Новый `frontend/js/admin/admin_access.js`** — слушает `auth:changed`; при `user.role === 'admin'` ставит `window.adminState = { isAdmin: true }`, инжектит кнопку «Add Product» в `.products-controls`, перерисовывает каталог `loadProducts(currentParams)`; при logout — убирает всё. Здесь же `getAuthHeaders()`.

**Шаг 3. `frontend/js/index/load_products.js`** — в шаблоне карточки условный блок «⋮»-меню (`.product-menu-btn` + dropdown «Edit»/«Delete») при `window.adminState?.isAdmin`; обработчики — делегированием (сетка перерисовывается). Плюс loading-стейт «Loading products…» перед fetch.

**Шаг 4. Новый `frontend/js/admin/admin_form.js`** — модалка (overlay + форма, показ через `.show`, инжектится только админу): Title, Category, Description, Price, Stock Quantity, Images (textarea — URL построчно → массив). Edit открывается с данными из `GET /api/products/:id`. Add → `POST /api/products` (полный body), Edit → `PUT /api/products/:id`. Ошибка API → текст в модалке, форма не очищается; 401 → «сессия истекла»; успех → тост + перезагрузка каталога.

**Шаг 5. Новый `frontend/js/admin/admin_delete.js`** — свой confirm-оверлей «Delete this product?» с кнопками Delete/Cancel (без `confirm()`); Cancel ничего не меняет; Delete → `DELETE /api/products/:id` → тост + перезагрузка каталога.

**Шаг 6. Новый `frontend/css/style_admin.css` + `index.html`** — стили кнопки, «⋮»-меню, модалки, confirm, `.toast.error`, loading; свой `showAdminToast(msg, type)` (контейнер `.toast-container` уже есть). В `index.html`: `<link>` + 3 admin-скрипта после `auth_ui.js`.

**Шаг 7. Админ-пользователь + финальная проверка** — при необходимости SQL: `docker compose exec db mysql -u buildmart_app -p123456 buildmart -e "UPDATE User SET role='admin' WHERE email='...'"`; после повышения — перелогин (роль зашита в JWT).

## Проверка
Каждый шаг тестируется через `docker compose up --build -d` → `http://localhost:8080` (фронт копируется в образ, пересборка обязательна). Финал — прогон по критериям ТЗ: гость/customer ничего не видят; админ добавляет/меняет/удаляет товар; каталог актуален; ошибки API показываются, форма сохраняет данные.