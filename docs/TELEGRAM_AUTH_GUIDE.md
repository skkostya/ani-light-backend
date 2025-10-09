# Руководство по авторизации через Telegram Mini App

## Обзор

Система поддерживает автоматическую регистрацию и авторизацию пользователей через Telegram Mini App. Пользователи, пришедшие через Telegram, автоматически регистрируются в системе без необходимости ввода пароля или email.

## Архитектура

### Типы авторизации

Система поддерживает два типа авторизации:

- `email` - традиционная авторизация через email и пароль
- `telegram` - авторизация через Telegram Mini App

### Структура пользователя

Пользователи Telegram имеют следующие особенности:

- `telegram_id` - уникальный идентификатор пользователя в Telegram
- `auth_type` - тип авторизации (всегда `telegram`)
- `email` - может быть `null` для Telegram пользователей
- `password_hash` - может быть `null` для Telegram пользователей
- Все остальные поля работают так же, как у обычных пользователей

## API Endpoints

### POST /auth/telegram

Автоматическая регистрация/авторизация пользователя через Telegram.

#### Запрос

```json
{
  "telegram_id": "123456789",
  "username": "telegram_user",
  "first_name": "Иван",
  "last_name": "Петров",
  "photo_url": "https://t.me/i/userpic/320/abc123.jpg"
}
```

#### Параметры

- `telegram_id` (string, обязательный) - ID пользователя в Telegram
- `username` (string, обязательный) - имя пользователя (минимум 3 символа)
- `first_name` (string, опциональный) - имя пользователя
- `last_name` (string, опциональный) - фамилия пользователя
- `photo_url` (string, опциональный) - URL аватара пользователя

#### Ответ

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

#### Особенности

1. **Автоматическая регистрация**: Если пользователь с таким `telegram_id` не существует, он автоматически регистрируется
2. **Повторная авторизация**: Если пользователь уже существует, возвращается существующий аккаунт с новым JWT токеном
3. **JWT токен**: Устанавливается в httpOnly cookie для безопасности
4. **Полные права**: Telegram пользователи имеют те же права, что и обычные пользователи

## Безопасность

### Валидация данных

- Все входящие данные валидируются с помощью class-validator
- `telegram_id` должен быть уникальным
- `username` должен содержать минимум 3 символа

### JWT токены

- Telegram пользователи получают JWT токены с теми же правами, что и обычные пользователи
- Токены содержат информацию о типе авторизации
- Токены устанавливаются в httpOnly cookie для защиты от XSS

### Rate Limiting

- Эндпоинт `/auth/telegram` имеет лимит 5 запросов в 5 секунд
- Это предотвращает злоупотребления при регистрации

## Интеграция с Telegram Mini App

### Frontend интеграция

```javascript
// Пример использования в Telegram Mini App
const telegramData = window.Telegram.WebApp.initDataUnsafe.user;

const authData = {
  telegram_id: telegramData.id.toString(),
  username:
    telegramData.username ||
    `${telegramData.first_name}_${telegramData.last_name}`,
  first_name: telegramData.first_name,
  last_name: telegramData.last_name,
  photo_url: telegramData.photo_url,
};

// Отправка запроса на авторизацию
fetch('/auth/telegram', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(authData),
  credentials: 'include', // Важно для cookie
})
  .then((response) => response.json())
  .then((data) => {
    console.log('Пользователь авторизован:', data.user);
    // Пользователь теперь авторизован и может использовать все функции
  });
```

### Проверка авторизации

```javascript
// Проверка статуса авторизации
fetch('/auth/profile', {
  credentials: 'include',
})
  .then((response) => response.json())
  .then((data) => {
    if (data.authenticated) {
      console.log('Пользователь авторизован:', data.user);
      console.log('Тип авторизации:', data.user.auth_type);
    } else {
      console.log('Пользователь не авторизован');
    }
  });
```

## База данных

### Миграции

Для поддержки Telegram авторизации были добавлены следующие поля в таблицу `user`:

```sql
-- Новые поля
ALTER TABLE "user" ADD "telegram_id" character varying;
ALTER TABLE "user" ADD "auth_type" "auth_type_enum" NOT NULL DEFAULT 'email';

-- Делаем email и password_hash nullable
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Уникальный индекс для telegram_id
CREATE UNIQUE INDEX "UQ_user_telegram_id" ON "user" ("telegram_id") WHERE "telegram_id" IS NOT NULL;
```

### Индексы

- `UQ_user_telegram_id` - уникальный индекс для быстрого поиска по telegram_id
- `IDX_user_auth_type` - индекс для фильтрации по типу авторизации

## Мониторинг и логирование

### Логирование

Все операции с Telegram пользователями логируются:

- Регистрация новых пользователей
- Повторная авторизация существующих пользователей
- Ошибки валидации

### Метрики

Рекомендуется отслеживать:

- Количество регистраций через Telegram
- Количество активных Telegram пользователей
- Конверсию Telegram пользователей в премиум подписки

## Ограничения и рекомендации

### Ограничения

1. **Уникальность telegram_id**: Каждый telegram_id может быть связан только с одним аккаунтом
2. **Валидация данных**: Все данные должны проходить валидацию на стороне сервера
3. **Rate limiting**: Соблюдение лимитов запросов для предотвращения злоупотреблений

### Рекомендации

1. **Верификация данных**: В будущем можно добавить верификацию данных через Telegram API
2. **Синхронизация профилей**: Регулярно обновлять данные профиля из Telegram
3. **Аналитика**: Отслеживать поведение Telegram пользователей для улучшения UX

## Будущие улучшения

### Планируемые функции

1. **Верификация через Telegram API**: Проверка подлинности данных пользователя
2. **Синхронизация профилей**: Автоматическое обновление данных из Telegram
3. **Telegram уведомления**: Отправка уведомлений через Telegram Bot API
4. **Расширенная аналитика**: Детальная аналитика поведения пользователей

### Интеграция с Telegram Bot

В будущем можно добавить:

- Telegram бота для управления аккаунтом
- Уведомления о новых сериях
- Интеграцию с Telegram Payments для подписок
