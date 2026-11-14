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
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    error: { type: "string", example: "Invalid product data" }
                },
                required: ["error"]
            },
            Product: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 12 },
                    title: { type: "string", example: "Кирпич строительный" },
                    category: { type: "string", example: "Кирпич" },
                    description: { type: "string", example: "Керамический строительный кирпич" },
                    price: {
                        description: "Цена. Prisma может вернуть Decimal в JSON как строку.",
                        oneOf: [
                            { type: "number", format: "float", example: 25.5 },
                            { type: "string", example: "25.50" }
                        ]
                    },
                    rating: { type: "number", format: "float", example: 4.5 },
                    images: {
                        type: "array",
                        minItems: 3,
                        items: { type: "string", example: "https://example.com/product_12_1.jpg" }
                    },
                    stockQuantity: { type: "integer", example: 100 },
                    createdAt: { type: "string", format: "date-time", example: "2026-11-14T12:00:00.000Z" }
                },
                required: ["id", "title", "category", "description", "price", "rating", "images", "stockQuantity", "createdAt"]
            },
            ProductCreate: {
                type: "object",
                properties: {
                    title: { type: "string", minLength: 1, example: "Кирпич строительный" },
                    description: { type: "string", minLength: 1, example: "Керамический строительный кирпич" },
                    price: { type: "number", minimum: 0, example: 25.5 },
                    images: {
                        type: "array",
                        minItems: 3,
                        items: { type: "string", example: "https://example.com/product_12_1.jpg" }
                    },
                    stockQuantity: { type: "integer", minimum: 0, example: 100 },
                    category: { type: "string", minLength: 1, example: "Кирпич" }
                },
                required: ["title", "description", "price", "images", "stockQuantity", "category"],
                additionalProperties: false
            },
            ProductUpdate: {
                type: "object",
                description: "Можно передать только изменяемые поля. Если images передано, в массиве должно быть не меньше трёх элементов.",
                properties: {
                    title: { type: "string", minLength: 1, example: "Кирпич строительный" },
                    description: { type: "string", minLength: 1, example: "Обновлённое описание товара" },
                    price: { type: "number", minimum: 0, example: 27.5 },
                    images: {
                        type: "array",
                        minItems: 3,
                        items: { type: "string", example: "https://example.com/product_12_1.jpg" }
                    },
                    stockQuantity: { type: "integer", minimum: 0, example: 80 },
                    category: { type: "string", minLength: 1, example: "Кирпич" }
                },
                additionalProperties: false
            },
            ProductListResponse: {
                type: "object",
                properties: {
                    items: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                    meta: { $ref: "#/components/schemas/Pagination" }
                },
                required: ["items", "meta"]
            },
            Pagination: {
                type: "object",
                properties: {
                    total_items: { type: "integer", example: 42 },
                    total_pages: { type: "integer", example: 4 },
                    current_page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 12 }
                },
                required: ["total_items", "total_pages", "current_page", "limit"]
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 5 },
                    email: { type: "string", format: "email", example: "customer@example.com" },
                    role: { type: "string", enum: ["customer", "admin"], example: "customer" },
                    createdAt: { type: "string", format: "date-time", example: "2026-11-14T12:00:00.000Z" }
                },
                required: ["id", "email", "role", "createdAt"]
            },
            Credentials: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email", example: "customer@example.com" },
                    password: { type: "string", format: "password", minLength: 8, example: "Password123" }
                },
                required: ["email", "password"],
                additionalProperties: false
            },
            RegisterResponse: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Success regiter" },
                    user: { $ref: "#/components/schemas/User" }
                },
                required: ["message", "user"]
            },
            LoginResponse: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Success login" },
                    token: { type: "string", description: "JWT, действительный в течение одного часа" },
                    user: { $ref: "#/components/schemas/User" }
                },
                required: ["message", "token", "user"]
            },
            CurrentUserResponse: {
                type: "object",
                properties: { user: { $ref: "#/components/schemas/User" } },
                required: ["user"]
            },
            CartResponse: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/CartProduct" }
                    },
                    total: { type: "number", format: "float", example: 51.0 }
                },
                required: ["items", "total"]
            },
            CartProduct: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "ID позиции в корзине", example: 2 },
                    productId: { type: "integer", example: 12 },
                    title: { type: "string", example: "Кирпич строительный" },
                    price: { type: "number", format: "float", example: 25.5 },
                    quantity: { type: "integer", example: 2 },
                    category: { type: "string", example: "Кирпич" },
                    images: { type: "array", items: { type: "string" } },
                    stockQuantity: { type: "integer", example: 100 }
                },
                required: ["id", "productId", "title", "price", "quantity", "category", "images", "stockQuantity"]
            },
            CartItem: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 2 },
                    cartId: { type: "integer", example: 1 },
                    productId: { type: "integer", example: 12 },
                    quantity: { type: "integer", example: 2 }
                },
                required: ["id", "cartId", "productId", "quantity"]
            },
            CartItemRequest: {
                type: "object",
                properties: {
                    productId: { type: "integer", minimum: 1, example: 12 },
                    quantity: { type: "integer", minimum: 1, example: 2 }
                },
                required: ["productId", "quantity"],
                additionalProperties: false
            },
            QuantityRequest: {
                type: "object",
                properties: { quantity: { type: "integer", minimum: 0, example: 3 } },
                required: ["quantity"],
                additionalProperties: false
            },
            MessageResponse: {
                type: "object",
                properties: { message: { type: "string", example: "Product removed from cart" } },
                required: ["message"]
            },
            CartMutationResponse: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Product added to cart" },
                    item: { $ref: "#/components/schemas/CartItem" }
                },
                required: ["message", "item"]
            },
            PromoRequest: {
                type: "object",
                properties: { code: { type: "string", minLength: 1, example: "SAVE10" } },
                required: ["code"],
                additionalProperties: false
            },
            PromoCalculation: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    promoCode: { type: "string", example: "SAVE10" },
                    discountPercent: { type: "integer", example: 10 },
                    subtotal: { type: "number", format: "float", example: 100 },
                    discount: { type: "number", format: "float", example: 10 },
                    tax: { type: "number", format: "float", example: 8 },
                    total: { type: "number", format: "float", example: 98 }
                },
                required: ["success", "promoCode", "discountPercent", "subtotal", "discount", "tax", "total"]
            }
        },
        responses: {
            BadRequest: {
                description: "Некорректные данные запроса",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            Unauthorized: {
                description: "Требуется действительный JWT-токен",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            Forbidden: {
                description: "Недостаточно прав: операция доступна только администратору",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            NotFound: {
                description: "Запрашиваемый объект не найден",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            Conflict: {
                description: "Пользователь с таким email уже зарегистрирован",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            InternalServerError: {
                description: "Внутренняя ошибка сервера",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            CacheStatus: {
                description: "Состояние кэша для GET-запроса",
                headers: {
                    "X-Cache": {
                        description: "HIT — ответ взят из кэша; MISS — ответ получен из базы данных",
                        schema: { type: "string", enum: ["HIT", "MISS"] }
                    }
                }
            }
        }
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
                        headers: { "X-Cache": { $ref: "#/components/responses/CacheStatus/headers/X-Cache" } },
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
                        headers: { "X-Cache": { $ref: "#/components/responses/CacheStatus/headers/X-Cache" } },
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
                    content: { "application/json": { schema: { $ref: "#/components/schemas/Credentials" } } }
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
                    content: { "application/json": { schema: { $ref: "#/components/schemas/Credentials" } } }
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
                        headers: { "X-Cache": { $ref: "#/components/responses/CacheStatus/headers/X-Cache" } },
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
                    "200": { description: "Товар добавлен", content: { "application/json": { schema: { $ref: "#/components/schemas/CartMutationResponse" } } } },
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
                    "200": { description: "Количество изменено", content: { "application/json": { schema: { $ref: "#/components/schemas/CartMutationResponse" } } } },
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
