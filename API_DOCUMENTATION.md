# API Документация ani-light-backend

## Общая информация

**Базовый URL:** `http://localhost:3000` (для разработки)  
**Версия API:** v1  
**Формат данных:** JSON  
**Аутентификация:** JWT токены в httpOnly cookies

## Аутентификация

API использует JWT токены для аутентификации. Токены автоматически устанавливаются в httpOnly cookies при успешной регистрации или входе.

### Типы аутентификации

- **Email/Password** - классическая регистрация через email и пароль
- **Telegram** - авторизация через Telegram

### Подписки

- **FREE** - бесплатная подписка (с рекламой)
- **PREMIUM** - премиум подписка (без рекламы)
- **VIP** - VIP подписка (без рекламы + дополнительные функции)

---

## Эндпоинты

### 🔐 Аутентификация (`/auth`)

#### POST `/auth/register`

Регистрация нового пользователя через email и пароль.

**Rate Limit:** 1 запрос в 5 секунд

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Validation:**

- `email` - валидный email адрес
- `username` - минимум 3 символа
- `password` - минимум 6 символов

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "subscription_type": "free",
    "subscription_expires_at": null,
    "hasActiveSubscription": false,
    "shouldHideAds": false,
    "auth_type": "email",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Регистрация прошла успешно"
}
```

**Status Codes:**

- `201` - Успешная регистрация
- `400` - Ошибка валидации
- `409` - Пользователь уже существует
- `429` - Превышен лимит запросов

---

#### POST `/auth/login`

Вход в систему через email и пароль.

**Rate Limit:** 2 запроса в 5 секунд

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "subscription_type": "free",
    "subscription_expires_at": null,
    "hasActiveSubscription": false,
    "shouldHideAds": false,
    "auth_type": "email",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Вход выполнен успешно"
}
```

**Status Codes:**

- `200` - Успешный вход
- `400` - Ошибка валидации
- `401` - Неверные учетные данные
- `429` - Превышен лимит запросов

---

#### POST `/auth/telegram`

Авторизация через Telegram.

**Rate Limit:** 5 запросов в 5 секунд

**Request Body:**

```json
{
  "telegram_id": "123456789",
  "username": "telegram_user",
  "first_name": "Имя",
  "last_name": "Фамилия",
  "photo_url": "https://example.com/photo.jpg"
}
```

**Validation:**

- `telegram_id` - обязательное поле
- `username` - минимум 3 символа
- `first_name`, `last_name`, `photo_url` - опциональные поля

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": null,
    "username": "telegram_user",
    "subscription_type": "free",
    "subscription_expires_at": null,
    "hasActiveSubscription": false,
    "shouldHideAds": false,
    "auth_type": "telegram",
    "telegram_id": "123456789",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Авторизация через Telegram прошла успешно"
}
```

---

#### GET `/auth/profile`

Получение информации о текущем пользователе.

**Аутентификация:** Опциональная (OptionalJwtGuard)

**Response (аутентифицированный пользователь):**

```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "subscription_type": "free",
    "subscription_expires_at": null,
    "hasActiveSubscription": false,
    "shouldHideAds": false,
    "auth_type": "email",
    "telegram_id": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "shouldHideAds": false
}
```

**Response (неаутентифицированный пользователь):**

```json
{
  "authenticated": false,
  "message": "Пользователь не аутентифицирован",
  "shouldHideAds": false
}
```

---

#### POST `/auth/logout`

Выход из системы.

**Response:**

```json
{
  "message": "Выход выполнен успешно"
}
```

---

### 🎌 Аниме (`/anime`)

Все эндпоинты аниме используют опциональную аутентификацию (OptionalJwtGuard).

#### GET `/anime`

Получение списка аниме с фильтрацией и пагинацией.

**Query Parameters:**

- `search` (string, optional) - поиск по названию
- `genre` (string, optional) - фильтр по жанру
- `year` (number, optional) - фильтр по году
- `page` (number, optional) - номер страницы (по умолчанию: 1)
- `limit` (number, optional) - количество элементов на странице (по умолчанию: 20, максимум: 100)

**Example Request:**

```
GET /anime?search=naruto&genre=action&year=2020&page=1&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "external_id": 12345,
      "title_ru": "Наруто",
      "title_en": "Naruto",
      "description": "Описание аниме...",
      "genres": ["action", "adventure", "shounen"],
      "year": 2020,
      "poster_url": "https://example.com/poster.jpg",
      "episodes": []
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10,
  "hasNext": true,
  "hasPrev": false,
  "shouldHideAds": false,
  "user": {
    "id": "uuid",
    "username": "username",
    "subscription_type": "free"
  }
}
```

---

#### GET `/anime/:id`

Получение детальной информации об аниме.

**Path Parameters:**

- `id` (UUID) - ID аниме

**Response:**

```json
{
  "id": "uuid",
  "external_id": 12345,
  "title_ru": "Наруто",
  "title_en": "Naruto",
  "description": "Описание аниме...",
  "genres": ["action", "adventure", "shounen"],
  "year": 2020,
  "poster_url": "https://example.com/poster.jpg",
  "episodes": [
    {
      "id": "uuid",
      "number": 1,
      "video_url": "https://example.com/video1.mp4",
      "subtitles_url": "https://example.com/subs1.vtt",
      "anime_id": "uuid"
    }
  ],
  "shouldHideAds": false,
  "user": {
    "id": "uuid",
    "username": "username",
    "subscription_type": "free"
  }
}
```

---

#### GET `/anime/:id/episodes`

Получение списка эпизодов аниме.

**Path Parameters:**

- `id` (UUID) - ID аниме

**Response:**

```json
{
  "episodes": [
    {
      "id": "uuid",
      "number": 1,
      "video_url": "https://example.com/video1.mp4",
      "subtitles_url": "https://example.com/subs1.vtt",
      "anime_id": "uuid"
    },
    {
      "id": "uuid",
      "number": 2,
      "video_url": "https://example.com/video2.mp4",
      "subtitles_url": "https://example.com/subs2.vtt",
      "anime_id": "uuid"
    }
  ],
  "shouldHideAds": false,
  "user": {
    "id": "uuid",
    "username": "username",
    "subscription_type": "free"
  }
}
```

---

#### GET `/anime/search`

Поиск аниме по названию.

**Rate Limit:** 2 запроса в 1 секунду

**Query Parameters:**

- `q` (string, required) - поисковый запрос

**Example Request:**

```
GET /anime/search?q=naruto
```

**Response:**

```json
{
  "results": [
    {
      "id": "uuid",
      "external_id": 12345,
      "title_ru": "Наруто",
      "title_en": "Naruto",
      "description": "Описание аниме...",
      "genres": ["action", "adventure", "shounen"],
      "year": 2020,
      "poster_url": "https://example.com/poster.jpg"
    }
  ],
  "shouldHideAds": false,
  "user": {
    "id": "uuid",
    "username": "username",
    "subscription_type": "free"
  }
}
```

---

### 📺 Эпизоды (`/episodes`)

#### GET `/episodes`

Получение эпизодов по ID аниме.

**Query Parameters:**

- `animeId` (UUID, required) - ID аниме

**Example Request:**

```
GET /episodes?animeId=uuid
```

**Response:**

```json
[
  {
    "id": "uuid",
    "number": 1,
    "video_url": "https://example.com/video1.mp4",
    "subtitles_url": "https://example.com/subs1.vtt",
    "anime_id": "uuid"
  },
  {
    "id": "uuid",
    "number": 2,
    "video_url": "https://example.com/video2.mp4",
    "subtitles_url": "https://example.com/subs2.vtt",
    "anime_id": "uuid"
  }
]
```

---

#### GET `/episodes/:id`

Получение детальной информации об эпизоде.

**Path Parameters:**

- `id` (UUID) - ID эпизода

**Response:**

```json
{
  "id": "uuid",
  "number": 1,
  "video_url": "https://example.com/video1.mp4",
  "subtitles_url": "https://example.com/subs1.vtt",
  "anime_id": "uuid",
  "anime": {
    "id": "uuid",
    "title_ru": "Наруто",
    "title_en": "Naruto",
    "poster_url": "https://example.com/poster.jpg"
  }
}
```

---

### 🏥 Health Check (`/health`)

Все health check эндпоинты исключены из rate limiting.

#### GET `/health`

Общая проверка здоровья системы.

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "message": "The process is using less than 150 MB of heap memory"
    },
    "memory_rss": {
      "status": "up",
      "message": "The process is using less than 300 MB of RSS memory"
    },
    "storage": {
      "status": "up",
      "message": "The disk usage is below the set threshold"
    }
  }
}
```

---

#### GET `/health/external`

Проверка внешних сервисов.

**Response:**

```json
{
  "status": "ok",
  "info": {
    "anilibria_api": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "anilibria_api": {
      "status": "up"
    }
  }
}
```

---

#### GET `/health/ready`

Проверка готовности системы к работе.

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "message": "The process is using less than 200 MB of heap memory"
    }
  }
}
```

---

#### GET `/health/live`

Проверка живости системы.

**Response:**

```json
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {}
}
```

---

## Модели данных

### User (Пользователь)

```typescript
{
  id: string;                    // UUID
  email?: string;                // Email (nullable для Telegram пользователей)
  username: string;              // Имя пользователя
  subscription_type: 'free' | 'premium' | 'vip';
  subscription_expires_at?: Date; // Дата истечения подписки
  hasActiveSubscription: boolean; // Виртуальное поле
  shouldHideAds: boolean;        // Виртуальное поле
  auth_type: 'email' | 'telegram';
  telegram_id?: string;          // ID в Telegram (nullable для email пользователей)
  created_at: Date;
  updated_at: Date;
}
```

### Anime (Аниме)

```typescript
{
  id: string;                    // UUID
  external_id?: number;          // ID в AniLibria API
  title_ru: string;              // Русское название
  title_en: string;              // Английское название
  description: string;            // Описание
  genres: string[];              // Массив жанров
  year: number;                  // Год выпуска
  poster_url: string;            // URL постера
  episodes: Episode[];           // Связанные эпизоды
}
```

### Episode (Эпизод)

```typescript
{
  id: string;                    // UUID
  anime_id: string;              // ID аниме
  number: number;                // Номер эпизода
  video_url: string;             // URL видео
  subtitles_url?: string;        // URL субтитров (опционально)
  anime?: Anime;                 // Связанное аниме
}
```

### PaginatedResponse (Пагинированный ответ)

```typescript
{
  data: T[];                     // Массив данных
  total: number;                 // Общее количество элементов
  page: number;                  // Текущая страница
  limit: number;                 // Количество элементов на странице
  totalPages: number;            // Общее количество страниц
  hasNext: boolean;              // Есть ли следующая страница
  hasPrev: boolean;              // Есть ли предыдущая страница
}
```

---

## Коды ошибок

### HTTP Status Codes

- `200` - OK - Успешный запрос
- `201` - Created - Ресурс успешно создан
- `400` - Bad Request - Ошибка валидации данных
- `401` - Unauthorized - Неверные учетные данные
- `404` - Not Found - Ресурс не найден
- `409` - Conflict - Конфликт (например, пользователь уже существует)
- `429` - Too Many Requests - Превышен лимит запросов
- `500` - Internal Server Error - Внутренняя ошибка сервера

### Формат ошибок

```json
{
  "statusCode": 400,
  "message": "Ошибка валидации",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Некорректный email адрес"
    }
  ]
}
```

---

## Rate Limiting

API использует rate limiting для защиты от злоупотреблений:

- **Регистрация:** 1 запрос в 5 секунд
- **Вход:** 2 запроса в 5 секунд
- **Telegram авторизация:** 5 запросов в 5 секунд
- **Поиск аниме:** 2 запроса в 1 секунду
- **Остальные эндпоинты:** Стандартные лимиты
- **Health checks:** Исключены из rate limiting

---

## Аутентификация и безопасность

### JWT Tokens

- Токены устанавливаются в httpOnly cookies
- Время жизни: 30 дней
- Защита от XSS атак через httpOnly флаг
- Защита от CSRF атак через sameSite: 'strict'
- HTTPS только в продакшене

### CORS

- Настроен для работы с frontend приложением
- Поддержка credentials для передачи cookies

### Валидация

- Все входящие данные валидируются с помощью class-validator
- Строгая типизация TypeScript
- Защита от SQL-инъекций через TypeORM

---

## Примеры использования

### Регистрация и вход

```javascript
// Регистрация
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Важно для cookies
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'username',
    password: 'password123',
  }),
});

// Вход
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
```

### Получение списка аниме

```javascript
// С фильтрацией и пагинацией
const animeResponse = await fetch('/anime?search=naruto&page=1&limit=10', {
  credentials: 'include',
});

const animeData = await animeResponse.json();
console.log(animeData.data); // Массив аниме
console.log(animeData.shouldHideAds); // Показывать ли рекламу
```

### Поиск аниме

```javascript
const searchResponse = await fetch('/anime/search?q=naruto', {
  credentials: 'include',
});

const searchData = await searchResponse.json();
console.log(searchData.results); // Результаты поиска
```

---

## Заметки для разработчиков

1. **Cookies:** Все аутентификационные токены передаются через httpOnly cookies, поэтому при запросах необходимо использовать `credentials: 'include'`

2. **Опциональная аутентификация:** Эндпоинты аниме работают как с аутентифицированными, так и с неаутентифицированными пользователями

3. **Пагинация:** Все списки поддерживают пагинацию с параметрами `page` и `limit`

4. **Фильтрация:** Список аниме поддерживает фильтрацию по жанру, году и поиску

5. **Rate Limiting:** Учитывайте лимиты запросов при разработке frontend

6. **Health Checks:** Используйте `/health/ready` для проверки готовности системы в Kubernetes/Docker

---

_Документация актуальна на момент создания. При изменении API обновляйте документацию соответственно._
