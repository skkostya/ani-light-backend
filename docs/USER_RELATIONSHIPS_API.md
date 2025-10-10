# API для связей пользователей с аниме и эпизодами

## Обзор

Данный API предоставляет функциональность для управления связями пользователей с аниме и эпизодами, включая:

- Избранное и списки просмотра
- Статусы просмотра эпизодов
- Комментарии к эпизодам с модерацией
- Рейтинги аниме и эпизодов
- Настройки уведомлений

## Аутентификация

Все эндпоинты требуют JWT токен в заголовке `Authorization: Bearer <token>`.

## Эндпоинты

### 1. Управление связями пользователь-аниме

#### `POST /user/anime`

Создать связь пользователя с аниме.

**Тело запроса:**

```json
{
  "anime_id": "uuid",
  "is_favorite": false,
  "want_to_watch": true,
  "notifications_telegram": false,
  "notifications_email": true,
  "rating": 8
}
```

#### `GET /user/anime`

Получить все связи пользователя с аниме.

#### `GET /user/anime/favorites`

Получить избранные аниме пользователя.

#### `GET /user/anime/want-to-watch`

Получить список "хочу посмотреть".

#### `PATCH /user/anime/:animeId`

Обновить связь с аниме.

#### `POST /user/anime/:animeId/toggle-favorite`

Переключить статус избранного.

#### `POST /user/anime/:animeId/toggle-want-to-watch`

Переключить статус "хочу посмотреть".

#### `DELETE /user/anime/:animeId`

Удалить связь с аниме.

### 2. Управление связями пользователь-эпизод

#### `POST /user/episodes`

Создать связь пользователя с эпизодом.

**Тело запроса:**

```json
{
  "episode_id": "uuid",
  "status": "watching",
  "rating": 7
}
```

**Статусы:** `not_watched`, `watching`, `watched`

#### `GET /user/episodes`

Получить все связи пользователя с эпизодами.

#### `GET /user/episodes/watched`

Получить просмотренные эпизоды.

#### `GET /user/episodes/watching`

Получить эпизоды в процессе просмотра.

#### `POST /user/episodes/:episodeId/mark-watched`

Отметить эпизод как просмотренный.

**Тело запроса:**

```json
{
  "watched_until_end": true
}
```

#### `POST /user/episodes/:episodeId/mark-watching`

Отметить эпизод как просматриваемый.

### 3. Комментарии к эпизодам

#### `POST /episodes/:episodeId/comments`

Создать комментарий к эпизоду.

**Тело запроса:**

```json
{
  "content": "Отличный эпизод!",
  "parent_comment_id": "uuid" // опционально, для ответов
}
```

#### `GET /episodes/:episodeId/comments`

Получить комментарии к эпизоду.

**Параметры запроса:**

- `page` - номер страницы (по умолчанию 1)
- `limit` - количество на странице (по умолчанию 20)

#### `GET /episodes/:episodeId/comments/:commentId/replies`

Получить ответы на комментарий.

#### `PATCH /episodes/:episodeId/comments/:commentId`

Обновить комментарий (только автор).

#### `DELETE /episodes/:episodeId/comments/:commentId`

Удалить комментарий (автор или админ).

#### `POST /episodes/:episodeId/comments/:commentId/reactions`

Добавить реакцию к комментарию.

**Тело запроса:**

```json
{
  "reaction_type": "like" // или "dislike"
}
```

#### `DELETE /episodes/:episodeId/comments/:commentId/reactions`

Удалить реакцию.

### 4. Рейтинги аниме

#### `POST /anime/:animeId/ratings`

Создать рейтинг аниме.

**Тело запроса:**

```json
{
  "rating": 9
}
```

**Диапазон:** 1-10

#### `GET /anime/:animeId/ratings`

Получить все рейтинги аниме.

#### `GET /anime/:animeId/ratings/average`

Получить средний рейтинг аниме.

#### `GET /anime/:animeId/ratings/my`

Получить мой рейтинг аниме.

#### `PATCH /anime/:animeId/ratings/my`

Обновить мой рейтинг аниме.

#### `DELETE /anime/:animeId/ratings/my`

Удалить мой рейтинг аниме.

### 5. Рейтинги эпизодов

#### `POST /episodes/:episodeId/ratings`

Создать рейтинг эпизода.

**Тело запроса:**

```json
{
  "rating": 8
}
```

#### `GET /episodes/:episodeId/ratings`

Получить все рейтинги эпизода.

#### `GET /episodes/:episodeId/ratings/average`

Получить средний рейтинг эпизода.

#### `GET /episodes/:episodeId/ratings/my`

Получить мой рейтинг эпизода.

#### `PATCH /episodes/:episodeId/ratings/my`

Обновить мой рейтинг эпизода.

#### `DELETE /episodes/:episodeId/ratings/my`

Удалить мой рейтинг эпизода.

### 6. Настройки уведомлений

#### `GET /user/notifications`

Получить настройки уведомлений пользователя.

#### `PATCH /user/notifications`

Обновить настройки уведомлений.

**Тело запроса:**

```json
{
  "notifications_enabled": true,
  "notifications_telegram_enabled": true,
  "notifications_email_enabled": false
}
```

## Особенности

### Модерация комментариев

- Комментарии проверяются на нецензурную лексику автоматически
- Комментарии с матами отклоняются с ошибкой 400
- Автор может удалить свой комментарий
- Админ может удалить любой комментарий

### Ограничения

- Один пользователь = одна реакция на комментарий
- Один пользователь = один рейтинг на аниме/эпизод
- Рейтинги принимают значения от 1 до 10
- Комментарии ограничены 2000 символами

### Коды ошибок

- `400` - Неверные данные (маты в комментариях, неверный рейтинг)
- `401` - Не авторизован
- `403` - Нет прав на операцию
- `404` - Ресурс не найден
- `409` - Конфликт (дублирование рейтинга/связи)

## Примеры использования

### Добавить аниме в избранное

```bash
curl -X POST http://localhost:3000/user/anime \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "anime-uuid", "is_favorite": true}'
```

### Отметить эпизод как просмотренный

```bash
curl -X POST http://localhost:3000/user/episodes/episode-uuid/mark-watched \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"watched_until_end": true}'
```

### Оставить комментарий

```bash
curl -X POST http://localhost:3000/episodes/episode-uuid/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Отличный эпизод! Очень понравилось."}'
```

### Поставить рейтинг аниме

```bash
curl -X POST http://localhost:3000/anime/anime-uuid/ratings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 9}'
```
