# Улучшения системы обработки ошибок авторизации

## Обзор изменений

Система обработки ошибок авторизации была значительно улучшена для предоставления более информативных и понятных сообщений об ошибках пользователям.

## Что изменилось

### 1. Новые типы ошибок авторизации

Создан enum `AuthErrorType` с детальными типами ошибок:

- `TOKEN_MISSING` - Токен авторизации не предоставлен
- `TOKEN_INVALID` - Недействительный токен авторизации
- `TOKEN_EXPIRED` - Срок действия токена истек
- `USER_NOT_FOUND` - Пользователь не найден
- `USER_INACTIVE` - Аккаунт заблокирован
- `INVALID_CREDENTIALS` - Неверные учетные данные
- `ACCESS_DENIED` - Доступ запрещен
- `SESSION_EXPIRED` - Сессия истекла

### 2. Улучшенные Guards

#### JwtAuthGuard

- Базовый guard с улучшенными сообщениями об ошибках
- Автоматическое определение типа ошибки
- Структурированные ответы с детальной информацией

#### DetailedJwtAuthGuard

- Расширенный guard с предложениями по устранению ошибок
- Отладочная информация в режиме разработки
- Более детальные сообщения для пользователей

#### OptionalJwtGuard

- Существующий guard без изменений
- Позволяет запросам проходить без авторизации

### 3. Улучшенный глобальный фильтр исключений

- Специальная обработка ошибок авторизации
- Сохранение структурированных ошибок
- Добавление метаданных запроса (path, method)

## Структура ответов об ошибках

### Старая структура (до изменений)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/protected",
  "method": "GET"
}
```

### Новая структура (после изменений)

```json
{
  "error": "Unauthorized",
  "message": "Токен авторизации не предоставлен",
  "details": "Для доступа к этому ресурсу необходимо авторизоваться. Пожалуйста, войдите в систему.",
  "errorType": "TOKEN_MISSING",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/protected",
  "method": "GET",
  "suggestions": [
    "Войдите в систему",
    "Проверьте, что вы авторизованы",
    "Обновите страницу"
  ]
}
```

## Примеры различных ошибок

### 1. Отсутствующий токен

```json
{
  "error": "Unauthorized",
  "message": "Токен авторизации не предоставлен",
  "details": "Для доступа к этому ресурсу необходимо авторизоваться. Пожалуйста, войдите в систему.",
  "errorType": "TOKEN_MISSING",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/protected",
  "method": "GET"
}
```

### 2. Истекший токен

```json
{
  "error": "Unauthorized",
  "message": "Срок действия токена истек",
  "details": "Срок действия вашего токена авторизации истек. Пожалуйста, войдите в систему заново.",
  "errorType": "TOKEN_EXPIRED",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/protected",
  "method": "GET",
  "suggestions": [
    "Войдите в систему заново",
    "Проверьте настройки времени на вашем устройстве"
  ]
}
```

### 3. Заблокированный аккаунт

```json
{
  "error": "Unauthorized",
  "message": "Аккаунт заблокирован",
  "details": "Ваш аккаунт заблокирован. Обратитесь к администратору для получения помощи.",
  "errorType": "USER_INACTIVE",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/protected",
  "method": "GET"
}
```

## Использование в коде

### Базовое использование

```typescript
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  // Ваши методы
}
```

### Детальная обработка ошибок

```typescript
import { DetailedJwtAuthGuard } from '../common/guards/detailed-jwt-auth.guard';

@Controller('api/user')
@UseGuards(DetailedJwtAuthGuard)
export class UserController {
  // Ваши методы с детальными ошибками
}
```

### Опциональная авторизация

```typescript
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';

@Controller('api/public')
@UseGuards(OptionalJwtGuard)
export class PublicController {
  // Методы доступные всем с дополнительной информацией о пользователе
}
```

## Тестирование

Для тестирования новых возможностей можно использовать демонстрационный контроллер:

```bash
# Тест защищенного эндпоинта (должен вернуть ошибку авторизации)
curl -X GET http://localhost:3000/api/auth-demo/protected

# Тест детального эндпоинта
curl -X GET http://localhost:3000/api/auth-demo/detailed

# Тест опционального эндпоинта (должен работать без токена)
curl -X GET http://localhost:3000/api/auth-demo/optional

# Тест публичного эндпоинта
curl -X GET http://localhost:3000/api/auth-demo/public
```

## Обратная совместимость

Все изменения обратно совместимы:

- Существующие контроллеры продолжают работать без изменений
- Старые guards остаются функциональными
- API endpoints не изменились

## Файлы, которые были изменены

1. `src/common/enums/auth-error.enum.ts` - Новый файл с типами ошибок
2. `src/common/guards/jwt-auth.guard.ts` - Обновлен с детальными ошибками
3. `src/common/strategies/jwt.strategy.ts` - Улучшена обработка ошибок
4. `src/common/filters/global-exception.filter.ts` - Специальная обработка auth ошибок
5. `src/common/guards/detailed-jwt-auth.guard.ts` - Новый расширенный guard
6. `src/common/guards/README.md` - Документация по guards
7. `src/common/controllers/auth-demo.controller.ts` - Демонстрационный контроллер

## Рекомендации

1. **Для новых API** - используйте `DetailedJwtAuthGuard` для лучшего UX
2. **Для существующих API** - постепенно мигрируйте на новые guards
3. **Для публичных API** - используйте `OptionalJwtGuard`
4. **Тестирование** - используйте демонстрационный контроллер для проверки

## Удаление демонстрационного контроллера

После тестирования можно удалить файл `src/common/controllers/auth-demo.controller.ts` и не регистрировать его в модулях.
