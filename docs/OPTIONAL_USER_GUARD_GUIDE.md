# 🛡️ OptionalUserGuard - Руководство по использованию

## Обзор

`OptionalUserGuard` - это guard-класс для извлечения авторизованного пользователя из cookie без обязательной проверки авторизации. Это идеальное решение для эндпоинтов, которые должны работать как для авторизованных, так и для неавторизованных пользователей.

## 🚀 Основные возможности

- **Извлечение из cookie**: Автоматически извлекает JWT токен из cookie `access_token`
- **Поддержка Authorization header**: Также поддерживает Bearer токены в заголовке
- **Безопасность**: Не блокирует запросы при отсутствии или невалидности токена
- **DI доступ**: Полный доступ к сервисам через Dependency Injection
- **Производительность**: Выполняется на уровне guard'а, до вызова контроллера

## 📝 Использование

### Базовое использование

```typescript
import { OptionalUserGuard } from '../../common/guards/optional-user.guard';

@Get()
@UseGuards(OptionalUserGuard)
async getData(@Request() req: any) {
  const user: User | null = req.user;

  if (user) {
    // Пользователь авторизован
    console.log('Пользователь:', user.username);
    return this.service.getDataForUser(user.id);
  } else {
    // Пользователь не авторизован
    return this.service.getDataForGuest();
  }
}
```

### В контроллерах

```typescript
@Controller('anime')
export class AnimeController {
  @Get()
  @UseGuards(OptionalUserGuard)
  async findAll(@Query() query: GetAnimeListDto, @Request() req: any) {
    const user: User | null = req.user;
    return await this.animeService.findAll(query, user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalUserGuard)
  async findOne(@Param() params: UuidParamDto, @Request() req: any) {
    const user: User | null = req.user;
    return await this.animeService.findOne(params.id, user?.id);
  }
}
```

## 🔧 Как это работает

### 1. Извлечение токена

Guard проверяет два источника токена в следующем порядке:

1. **Authorization header**: `Authorization: Bearer <token>`
2. **Cookie**: `access_token=<token>`

### 2. Валидация токена

```typescript
const payload: JwtPayloadDto = this.jwtService.verify(token, {
  secret: this.configService.get('JWT_SECRET'),
});
```

### 3. Получение пользователя

```typescript
const user = await this.userService.validateUser(payload);
request.user = user;
```

### 4. Возврат результата

- **Если токен валидный и пользователь найден**: `req.user` содержит объект `User`
- **Если токен отсутствует/невалидный/пользователь не найден**: `req.user = null`
- **Guard всегда возвращает `true`**: Не блокирует запросы

## 🛡️ Безопасность

### Обработка ошибок

Guard **не выбрасывает исключения** при:

- Отсутствии токена
- Невалидном токене
- Истекшем токене
- Несуществующем пользователе

Вместо этого он просто устанавливает `req.user = null`, позволяя эндпоинту работать для неавторизованных пользователей.

### Логирование

Все ошибки логируются, но не прерывают выполнение запроса:

```typescript
try {
  // Валидация токена и получение пользователя
} catch (error) {
  console.error('OptionalUserGuard - token validation error:', error.message);
  request.user = null;
}
```

## 📊 Примеры использования

### Список аниме с персонализацией

```typescript
@Get()
@UseGuards(OptionalUserGuard)
async findAll(
  @Query() query: GetAnimeListDto,
  @Request() req: any,
) {
  const user: User | null = req.user;
  const result = await this.animeService.findAll(query, user?.id);

  // Для авторизованных пользователей добавляем дополнительную информацию
  if (user) {
    result.userInfo = {
      hasActiveSubscription: user.hasActiveSubscription,
      shouldHideAds: user.shouldHideAds,
    };
  }

  return result;
}
```

### Детальная информация об аниме

```typescript
@Get(':id')
@UseGuards(OptionalUserGuard)
async findOne(
  @Param() params: UuidParamDto,
  @Request() req: any,
) {
  const user: User | null = req.user;
  const anime = await this.animeService.findOne(params.id, user?.id);

  // Добавляем информацию о взаимодействии пользователя с аниме
  if (user && anime.userAnime) {
    anime.userInteraction = {
      isFavorite: anime.userAnime.is_favorite,
      isWatching: anime.userAnime.is_watching,
      rating: anime.userAnime.rating,
    };
  }

  return anime;
}
```

### Статистика с учетом пользователя

```typescript
@Get('stats')
@UseGuards(OptionalUserGuard)
async getStats(@Request() req: any) {
  const user: User | null = req.user;
  const stats = await this.animeService.getStats();

  // Для авторизованных пользователей показываем персональную статистику
  if (user) {
    stats.personal = await this.animeService.getPersonalStats(user.id);
  }

  return stats;
}
```

## 🔄 Миграция с @OptionalUser() декоратора

### Было (декоратор)

```typescript
@Get()
async findAll(
  @Query() query: GetAnimeListDto,
  @OptionalUser() user: User | null,
) {
  return await this.animeService.findAll(query, user?.id);
}
```

### Стало (guard)

```typescript
@Get()
@UseGuards(OptionalUserGuard)
async findAll(
  @Query() query: GetAnimeListDto,
  @Request() req: any,
) {
  const user: User | null = req.user;
  return await this.animeService.findAll(query, user?.id);
}
```

## ✅ Преимущества

1. **Надежность**: Полный доступ к сервисам через DI
2. **Производительность**: Выполняется на уровне guard'а
3. **Простота**: Не требует сложной настройки
4. **Отладка**: Подробное логирование процесса
5. **Консистентность**: Единообразный подход во всех контроллерах

## 🚨 Важные замечания

1. **Всегда используйте типизацию**: `const user: User | null = req.user`
2. **Проверяйте на null**: `if (user) { ... }`
3. **Используйте @Request()**: Для получения `req.user`
4. **Не забывайте про user?.id**: Безопасное извлечение ID пользователя

## 🧪 Тестирование

### Тестовый эндпоинт

```typescript
@Controller('test-optional-user')
export class TestOptionalUserController {
  @Get()
  @UseGuards(OptionalUserGuard)
  async testOptionalUser(@Request() req: any) {
    const user: User | null = req.user;

    return {
      message: 'Тест guard OptionalUserGuard',
      user: user
        ? {
            id: user.id,
            username: user.username,
            email: user.email,
          }
        : null,
      isAuthenticated: !!user,
    };
  }
}
```

### Тестирование

```bash
# Без авторизации
curl -X GET http://localhost:3000/test-optional-user

# С токеном в cookie
curl -X GET http://localhost:3000/test-optional-user \
  -H "Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# С Bearer токеном
curl -X GET http://localhost:3000/test-optional-user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🔗 Связанные файлы

- `src/common/guards/optional-user.guard.ts` - Реализация guard'а
- `src/test-optional-user.controller.ts` - Тест-контроллер
- `src/modules/anime/anime.controller.ts` - Примеры использования
