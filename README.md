# BuildMart

Учебный интернет-магазин строительных материалов. В проекте есть каталог товаров, поиск, фильтры, сортировка и пагинация, регистрация и вход, корзина с промокодом, а также операции администратора над товарами.

## Возможности

- просмотр каталога и страницы товара;
- поиск по названию и описанию, фильтры по цене, рейтингу и категории, сортировка и переключение страниц;
- регистрация и вход с JWT-токеном, роли `customer` и `admin`;
- просмотр и изменение корзины пользователя;
- применение промокода `SAVE10`;
- добавление, изменение и удаление товаров администратором;
- кэширование ответов через Memcached;
- интерактивная документация API на Swagger UI.

## Технологии

- Node.js 24, Express 5;
- HTML, CSS и JavaScript для интерфейса;
- MySQL-совместимая база данных, Prisma ORM;
- Memcached;
- Docker Compose;
- Swagger UI и OpenAPI 3.

Express раздаёт файлы из `frontend/` и API с одного адреса. Поэтому браузерный интерфейс и API в текущем развёртывании работают с одного origin.

## Запуск локально через Docker Compose

Это рекомендуемый способ запустить проект локально. Понадобятся Docker Desktop и Docker Compose.

1. Создай файл настроек из шаблона в корне проекта:

   ```powershell
   Copy-Item .env.docker.example .env.docker
   ```

2. Открой `.env.docker` и задай значения для паролей и секрета. В `DATABASE_URL` используй имя сервиса `db`, а для Memcached — `memcached:11211`.

3. Из корня проекта собери образ и запусти сервисы:

   ```powershell
   docker compose --env-file .env.docker up --build -d
   ```

После запуска:

- сайт: <http://localhost:8081>
- Swagger UI: <http://localhost:8081/api/docs>
- API-маршруты используют префикс `/api`.

Посмотреть журнал приложения:

```powershell
docker compose --env-file .env.docker logs -f app
```

Остановить сервисы, сохранив данные базы:

```powershell
docker compose --env-file .env.docker down
```

База хранится в Docker-томе `buildmart_db_data`, поэтому обычная остановка контейнеров данные не удаляет. Чтобы удалить том и все данные локальной базы, выполни `docker compose --env-file .env.docker down --volumes`.

При старте приложения автоматически применяются Prisma-миграции, создаются начальный администратор и промокод `SAVE10`, если их ещё нет.

## Запуск backend без Docker

Для этого варианта нужны Node.js 24, запущенный локальный MySQL и Memcached. Создай базу данных `buildmart` и настрой пользователя MySQL с доступом к ней.

В PowerShell из корня проекта создай локальный файл настроек:

```powershell
Copy-Item backend/.env.example backend/.env
```

Проверь, что в `backend/.env` заданы адрес локальной базы (`localhost:3306`), `PORT=8080`, секрет `JWT_SECRET` и `MEMCACHED_SERVERS=localhost:11211`.

Затем установи зависимости и запусти приложение из папки `backend`:

```powershell
Set-Location backend
npm ci
npx prisma generate --config ./prisma7.config.ts
npx prisma migrate deploy --config ./prisma7.config.ts
node scripts/create-admin.js
node scripts/create-promo.js
npm start
```

Сайт будет доступен на <http://localhost:8080>, Swagger UI — на <http://localhost:8080/api/docs>. В этом варианте Memcached должен быть запущен отдельно на `localhost:11211`.

## Переменные окружения

Не добавляй реальные пароли и секреты в Git. Файлы `.env` с локальными настройками предназначены только для твоей машины.

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | Строка подключения к MySQL/TiDB. Для Compose хост — `db`; для запуска backend на компьютере — `localhost`. |
| `JWT_SECRET` | Секрет для подписи JWT-токенов. Задай собственное случайное значение. |
| `MEMCACHED_SERVERS` | Адрес Memcached. Compose: `memcached:11211`; запуск Node.js напрямую: `localhost:11211`; Render: `127.0.0.1:11211`. |
| `PORT` | Порт Express-сервера. Локально обычно `8080`; в Docker Compose внутренний порт — `8080`. |
| `DB_ROOT_PASSWORD` | Пароль root-пользователя MySQL в Docker Compose. |
| `DB_PASSWORD` | Пароль пользователя приложения MySQL в Docker Compose. Он должен совпадать с паролем в `DATABASE_URL`. |
| `ADMIN_EMAIL` | Email начального администратора. Если не задан, используется `admin@example.com`. |
| `ADMIN_PASSWORD` | Пароль начального администратора. Если не задан, используется `ADMIN123`; для развёрнутого сервиса обязательно задай собственный пароль. |

Для Docker Compose используй корневой `.env.docker`, созданный из `.env.docker.example`. Для запуска backend напрямую используется `backend/.env`, созданный из `backend/.env.example`. Это разные файлы и значения: например, адрес `db` работает внутри Compose-сети, а `localhost` — при запуске backend на компьютере.

`CLOUDINARY_URL` пока присутствует в `backend/.env.example`, но текущий backend его не использует для своих операций.

## Развёртывание на Render

В Render задаются переменные окружения для развёрнутого сервиса, а не загружается локальный `.env`:

- `DATABASE_URL` — строка подключения к облачной MySQL-совместимой базе TiDB;
- `JWT_SECRET` — собственный секрет;
- `MEMCACHED_SERVERS=127.0.0.1:11211` — Memcached запускается в том же контейнере, что и приложение;
- `ADMIN_EMAIL` и `ADMIN_PASSWORD` — учётные данные начального администратора.

Поле **Docker Command** в Render оставь пустым, чтобы использовалась команда запуска из Dockerfile: она запускает Memcached, применяет миграции и начальные данные, затем стартует сервер. Страница сайта открывается по адресу Render-сервиса, Swagger UI — по адресу `<адрес-сервиса>/api/docs`.

## API

Полная интерактивная документация доступна по `/api/docs`.

| Метод и путь | Назначение | Доступ |
| --- | --- | --- |
| `GET /api/products` | Список, поиск, фильтры, сортировка и пагинация товаров | Публичный |
| `GET /api/products/{id}` | Получить товар | Публичный |
| `POST /api/products` | Создать товар | Администратор |
| `PUT /api/products/{id}` | Изменить товар | Администратор |
| `DELETE /api/products/{id}` | Удалить товар | Администратор |
| `POST /api/auth/register` | Регистрация | Публичный |
| `POST /api/auth/login` | Вход и получение JWT | Публичный |
| `GET /api/auth/me` | Получить данные текущего пользователя | JWT |
| `GET /api/cart` | Получить корзину | JWT |
| `POST /api/cart/items` | Добавить товар в корзину | JWT |
| `PATCH /api/cart/items/{id}` | Изменить количество | JWT |
| `DELETE /api/cart/items/{id}` | Удалить товар из корзины | JWT |
| `POST /api/cart/apply-promo` | Рассчитать скидку по промокоду | JWT |

Для защищённых запросов в Swagger нажми **Authorize** и введи JWT-токен, полученный от `POST /api/auth/login`. Swagger самостоятельно добавит префикс `Bearer`.
