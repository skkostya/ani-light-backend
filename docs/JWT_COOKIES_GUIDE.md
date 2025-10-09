# 🍪 JWT + Cookies Authentication Guide

## Обзор

Система аутентификации поддерживает **два способа** передачи JWT токена:

1. **Authorization Header** (Bearer Token) - для API клиентов
2. **HTTP-Only Cookies** - для веб-приложений (более безопасно)

## 🔐 Как это работает

### Приоритет извлечения токена:

1. **Сначала** проверяется заголовок `Authorization: Bearer <token>`
2. **Если нет** - проверяется cookie `access_token`
3. **Если нигде нет** - пользователь считается неаутентифицированным

### Безопасность cookies:

```javascript
{
  httpOnly: true,        // Защита от XSS атак
  secure: true,          // HTTPS только в продакшене
  sameSite: 'strict',    // Защита от CSRF атак
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
  path: '/'              // Доступен для всего сайта
}
```

## 📡 API Endpoints

### Регистрация

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Ответ:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "subscription_type": "free",
    "hasActiveSubscription": false,
    "shouldHideAds": false
  },
  "message": "Регистрация прошла успешно"
}
```

**Cookie устанавливается автоматически:**

```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/
```

### Вход

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ аналогичен регистрации** + cookie устанавливается.

### Выход

```http
POST /auth/logout
```

**Ответ:**

```json
{
  "message": "Выход выполнен успешно"
}
```

**Cookie очищается:**

```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

### Профиль пользователя

```http
GET /auth/profile
```

**С токеном (любым способом):**

```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "subscription_type": "premium",
    "hasActiveSubscription": true,
    "shouldHideAds": true
  },
  "shouldHideAds": true
}
```

**Без токена:**

```json
{
  "authenticated": false,
  "message": "Пользователь не аутентифицирован",
  "shouldHideAds": false
}
```

## 🌐 Использование с фронтендом

### Вариант 1: Cookies (Рекомендуется для веб-приложений)

```javascript
// Регистрация/Вход - cookie устанавливается автоматически
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // ВАЖНО: включить cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

// Все последующие запросы автоматически включают cookie
const animeList = await fetch('/anime', {
  credentials: 'include', // ВАЖНО: включить cookies
});

// Выход
await fetch('/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

### Вариант 2: Authorization Header (Для API клиентов)

```javascript
// Получаем токен при входе
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

// Извлекаем токен из cookie (если нужно для API)
const token = document.cookie
  .split('; ')
  .find((row) => row.startsWith('access_token='))
  ?.split('=')[1];

// Используем в заголовках
const animeList = await fetch('/anime', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 🔄 Интеграция с существующими эндпоинтами

Все эндпоинты аниме **автоматически** поддерживают оба способа аутентификации:

```http
# С cookie (автоматически)
GET /anime
Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# С заголовком
GET /anime
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Без токена (тоже работает)
GET /anime
```

**Ответ всегда включает информацию о пользователе:**

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "shouldHideAds": true,  // ← Зависит от подписки
  "user": {               // ← null если не аутентифицирован
    "id": "uuid",
    "username": "username",
    "subscription_type": "premium"
  }
}
```

## 🛡️ Безопасность

### Преимущества HTTP-Only Cookies:

- ✅ **Защита от XSS** - JavaScript не может получить доступ к токену
- ✅ **Автоматическая отправка** - браузер сам включает cookie в запросы
- ✅ **Защита от CSRF** - SameSite=Strict предотвращает межсайтовые запросы
- ✅ **Безопасное хранение** - токен не доступен через localStorage/sessionStorage

### Рекомендации:

1. **Для веб-приложений** - используйте cookies с `credentials: 'include'`
2. **Для мобильных/API клиентов** - используйте Authorization header
3. **В продакшене** - обязательно HTTPS для secure cookies
4. **Для SPA** - настройте CORS с `credentials: true`

## 🧪 Тестирование

```bash
# Регистрация с получением cookie
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}' \
  -c cookies.txt

# Использование cookie для запроса
curl http://localhost:3001/anime \
  -b cookies.txt

# Выход с очисткой cookie
curl -X POST http://localhost:3001/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

## 🔧 Настройка

### Environment Variables:

```env
JWT_SECRET=your-super-secret-key
NODE_ENV=production  # Для secure cookies
```

### CORS для фронтенда:

```typescript
// В main.ts уже настроено
app.enableCors({
  origin: 'http://localhost:3000', // Ваш фронтенд
  credentials: true, // ВАЖНО для cookies
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
});
```

---

**Готово!** 🎉 Теперь ваше приложение поддерживает удобную и безопасную аутентификацию через cookies!
