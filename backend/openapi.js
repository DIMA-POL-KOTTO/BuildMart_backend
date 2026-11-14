const openapi = {
    openapi: "3.0.3",
    info: {
        title: "BuildMart API",
        version: "1.0.0",
        description: "API интернет-магазина BuildMart. Для защищённых запросов нажми Authorize и введи JWT-токен, полученный при входе."
    },
    servers: [
        {
            url: "/",
            description: "Текущий сервер"
        }
    ],
    tags: [
        { name: "Товары", description: "Каталог и управление товарами" },
        { name: "Авторизация", description: "Регистрация, вход и данные текущего пользователя" },
        { name: "Корзина", description: "Корзина текущего пользователя и промокоды" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
    },
    paths: {
        "/api/products": {
            get: {
                tags: ["Товары"],
                summary: "Получить каталог товаров",
                description: "Возвращает страницу каталога. Можно фильтровать, искать и сортировать товары.",
                operationId: "listProducts",
                parameters: [
                    { name: "min_price", in: "query", description: "Минимальная цена", schema: { type: "number", minimum: 0 } },
                    { name: "max_price", in: "query", description: "Максимальная цена", schema: { type: "number", minimum: 0 } },
                    { name: "min_rating", in: "query", description: "Минимальный рейтинг от 0 до 5", schema: { type: "number", minimum: 0, maximum: 5 } },
                    { name: "category", in: "query", description: "Точное название категории", schema: { type: "string" } },
                    { name: "search", in: "query", description: "Поиск по названию и описанию", schema: { type: "string" } },
                    { name: "sort_by", in: "query", description: "Поле сортировки. Если задан order, sort_by обязателен.", schema: { type: "string", enum: ["price", "title"] } },
                    { name: "order", in: "query", description: "Направление сортировки", schema: { type: "string", enum: ["asc", "desc"] } },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                    { name: "limit", in: "query", description: "Количество товаров на странице, максимум 100", schema: { type: "integer", minimum: 1, maximum: 100, default: 12 } }
                ],
                responses: {
                    "200": {
                        description: "Страница каталога",
                        headers: { "X-Cache": { $ref: "#/components/headers/CacheStatus" } },
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ProductListResponse" } } }
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            post: {
                tags: ["Товары"],
                summary: "Добавить товар",
                operationId: "createProduct",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/ProductCreate" } } }
                },
                responses: {
                    "201": { description: "Товар создан", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/products/{id}": {
            parameters: [{ name: "id", in: "path", required: true, description: "ID товара", schema: { type: "integer", minimum: 1 } }],
            get: {
                tags: ["Товары"],
                summary: "Получить товар по ID",
                operationId: "getProduct",
                responses: {
                    "200": {
                        description: "Товар",
                        headers: { "X-Cache": { $ref: "#/components/headers/CacheStatus" } },
                        content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } }
                    },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            put: {
                tags: ["Товары"],
                summary: "Изменить товар",
                description: "Доступно только пользователю с ролью admin.",
                operationId: "updateProduct",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/ProductUpdate" } } }
                },
                responses: {
                    "200": { description: "Товар изменён", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            delete: {
                tags: ["Товары"],
                summary: "Удалить товар",
                description: "Доступно только пользователю с ролью admin.",
                operationId: "deleteProduct",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "Результат удаления", content: { "application/json": { schema: { type: "string", example: "Product deleting success!" } } } },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/auth/register": {
            post: {
                tags: ["Авторизация"],
                summary: "Зарегистрировать пользователя",
                operationId: "register",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/RegistrationCredentials" } } }
                },
                responses: {
                    "201": { description: "Пользователь создан", content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterResponse" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "409": { $ref: "#/components/responses/Conflict" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/auth/login": {
            post: {
                tags: ["Авторизация"],
                summary: "Войти и получить JWT",
                operationId: "login",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LoginCredentials" } } }
                },
                responses: {
                    "200": { description: "Вход выполнен", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/auth/me": {
            get: {
                tags: ["Авторизация"],
                summary: "Получить текущего пользователя",
                operationId: "getCurrentUser",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "Текущий пользователь", content: { "application/json": { schema: { $ref: "#/components/schemas/CurrentUserResponse" } } } },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/cart": {
            get: {
                tags: ["Корзина"],
                summary: "Получить корзину текущего пользователя",
                operationId: "getCart",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Содержимое корзины",
                        headers: { "X-Cache": { $ref: "#/components/headers/CacheStatus" } },
                        content: { "application/json": { schema: { $ref: "#/components/schemas/CartResponse" } } }
                    },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/cart/items": {
            post: {
                tags: ["Корзина"],
                summary: "Добавить товар в корзину",
                operationId: "addCartItem",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CartItemRequest" } } }
                },
                responses: {
                    "200": { description: "Товар добавлен", content: { "application/json": { schema: { $ref: "#/components/schemas/AddCartItemResponse" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/cart/items/{id}": {
            parameters: [{ name: "id", in: "path", required: true, description: "ID позиции корзины", schema: { type: "integer", minimum: 1 } }],
            patch: {
                tags: ["Корзина"],
                summary: "Изменить количество товара в корзине",
                operationId: "updateCartItem",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/QuantityRequest" } } }
                },
                responses: {
                    "200": { description: "Количество изменено", content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCartItemResponse" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            delete: {
                tags: ["Корзина"],
                summary: "Удалить позицию из корзины",
                operationId: "deleteCartItem",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "Позиция удалена", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api/cart/apply-promo": {
            post: {
                tags: ["Корзина"],
                summary: "Применить промокод и рассчитать скидку",
                operationId: "applyPromoCode",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/PromoRequest" } } }
                },
                responses: {
                    "200": { description: "Расчёт с учётом промокода", content: { "application/json": { schema: { $ref: "#/components/schemas/PromoCalculation" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        }
    }
};

export default openapi;
