# 🎬 Ani-Light Backend

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <strong>Production-ready backend для аниме стриминг платформы</strong><br>
  Мощный API с аутентификацией, кэшированием, мониторингом и интеграцией с AniLibria
</p>

---

## 🚀 Особенности

### 🎯 **Core Features**

- ✅ **REST API** для аниме контента с полной пагинацией
- ✅ **Опциональная JWT аутентификация** (Headers + HTTP-Only Cookies)
- ✅ **Система подписок** (Free/Premium/VIP) для отключения рекламы
- ✅ **Интеграция с AniLibria API** для получения контента
- ✅ **Redis кэширование** для оптимизации производительности

### 🛡️ **Security & Performance**

- ✅ **Rate Limiting** (многоуровневые лимиты)
- ✅ **Helmet Security Headers** + CORS
- ✅ **Global Validation** всех входящих данных
- ✅ **HTTP Retry Logic** для внешних API
- ✅ **Response Compression** (gzip)

### 📊 **Monitoring & Logging**

- ✅ **Prometheus Metrics** для мониторинга
- ✅ **Winston Structured Logging** (файлы + консоль)
- ✅ **Health Check Endpoints** для Kubernetes
- ✅ **Database Indexes** для оптимизации запросов

### 🧪 **Testing & Quality**

- ✅ **Unit Tests** (23+ тестов)
- ✅ **E2E Tests** для API
- ✅ **ESLint + Prettier** конфигурация
- ✅ **TypeORM Migrations** для управления БД

---

## 📋 Требования

### Системные требования:

- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0

### Рекомендуемые:

- **Docker** & **Docker Compose** (для простого запуска)
- **Git** для клонирования репозитория

---

## 🛠️ Быстрый старт

### 1️⃣ Клонирование и установка

```bash
# Клонируем репозиторий
git clone <repository-url>
cd ani-light-backend

# Устанавливаем зависимости
yarn install
```

### 2️⃣ Настройка окружения

Создайте файл `.env` в корне проекта:

```env
# 🗄️ База данных PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ani_light_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ani_light_db

# 🔴 Redis для кэширования
REDIS_HOST=localhost
REDIS_PORT=6379

# 🔐 JWT секретный ключ
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 🌐 API настройки
ANILIBRIA_API_URL=https://anilibria.top/api/v1
FRONTEND_URL=http://localhost:3000

# 📊 Настройки приложения
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

### 3️⃣ Запуск с Docker (Рекомендуется)

```bash
# Создаем docker-compose.yml (см. ниже)
# Запускаем все сервисы
docker-compose up -d

# Применяем миграции
yarn typeorm:up

# Запускаем приложение
yarn start:dev
```

### 4️⃣ Ручной запуск (без Docker)

```bash
# 1. Запустите PostgreSQL и Redis
# 2. Создайте базу данных
createdb ani_light_db

# 3. Примените миграции
yarn typeorm:up

# 4. Запустите приложение
yarn start:dev
```

---

## 🐳 Docker Compose

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ani_light_db
      POSTGRES_USER: ani_light_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ani_light_user -d ani_light_db']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## 🚀 Команды разработки

### Основные команды:

```bash
# 🔥 Разработка с hot-reload
yarn start:dev

# 🏗️ Сборка проекта
yarn build

# 🚀 Продакшн запуск
yarn start:prod

# 🧹 Форматирование кода
yarn format

# 🔍 Проверка линтером
yarn lint

# 🔧 Автофикс линтера
yarn lint --fix
```

### Тестирование:

```bash
# 🧪 Unit тесты
yarn test

# 🔄 Watch режим для тестов
yarn test:watch

# 🌐 E2E тесты
yarn test:e2e

# 📊 Покрытие кода
yarn test:cov
```

### База данных:

```bash
# 📝 Создать миграцию
yarn typeorm:create src/migrations/migration-name

# 🔄 Сгенерировать миграцию из изменений
yarn typeorm:generate src/migrations/migration-name

# ⬆️ Применить миграции
yarn typeorm:up

# ⬇️ Откатить миграцию
yarn typeorm:down
```

---

## 📡 API Endpoints

### 🎬 Аниме контент:

```http
GET    /anime                    # Список аниме с пагинацией
GET    /anime/:id               # Детали аниме
GET    /anime/:id/episodes      # Эпизоды аниме
GET    /anime/search?q=query    # Поиск аниме
```

### 🔐 Аутентификация:

```http
POST   /auth/register           # Регистрация пользователя
POST   /auth/login              # Вход в систему
POST   /auth/logout             # Выход из системы
GET    /auth/profile            # Профиль пользователя
```

### 📊 Мониторинг:

```http
GET    /health                  # Статус системы
GET    /health/live             # Liveness probe
GET    /health/ready            # Readiness probe
GET    /metrics                 # Prometheus метрики
```

### Примеры запросов:

```bash
# Получить список аниме
curl "http://localhost:3001/anime?page=1&limit=10"

# Поиск аниме
curl "http://localhost:3001/anime/search?q=наруто"

# Регистрация пользователя
curl -X POST "http://localhost:3001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"password123"}'

# Проверка здоровья системы
curl "http://localhost:3001/health"
```

---

## 🔧 Конфигурация

### Environment Variables:

| Переменная          | Описание            | По умолчанию            |
| ------------------- | ------------------- | ----------------------- |
| `POSTGRES_HOST`     | Хост PostgreSQL     | `localhost`             |
| `POSTGRES_PORT`     | Порт PostgreSQL     | `5432`                  |
| `POSTGRES_USER`     | Пользователь БД     | -                       |
| `POSTGRES_PASSWORD` | Пароль БД           | -                       |
| `POSTGRES_DB`       | Имя базы данных     | -                       |
| `REDIS_HOST`        | Хост Redis          | `localhost`             |
| `REDIS_PORT`        | Порт Redis          | `6379`                  |
| `JWT_SECRET`        | Секрет для JWT      | -                       |
| `ANILIBRIA_API_URL` | URL AniLibria API   | -                       |
| `FRONTEND_URL`      | URL фронтенда       | `http://localhost:3000` |
| `NODE_ENV`          | Окружение           | `development`           |
| `PORT`              | Порт приложения     | `3001`                  |
| `LOG_LEVEL`         | Уровень логирования | `info`                  |

### Rate Limiting:

- **Short**: 3 запроса/секунда
- **Medium**: 20 запросов/10 секунд
- **Long**: 100 запросов/минута
- **Search**: 2 запроса/секунда (строже)

---

## 🧪 Тестирование

### Структура тестов:

```
src/
├── modules/
│   ├── anime/
│   │   ├── anime.service.spec.ts     # Unit тесты
│   │   └── anime.controller.spec.ts  # Controller тесты
│   └── user/
│       └── user.service.spec.ts      # Unit тесты
test/
└── app.e2e-spec.ts                   # E2E тесты
```

### Запуск тестов:

```bash
# Все тесты
yarn test

# Только unit тесты
yarn test --testPathPattern="\.spec\.ts$"

# Только E2E тесты
yarn test:e2e

# С покрытием кода
yarn test:cov

# Конкретный файл
yarn test anime.service.spec.ts
```

---

## 📊 Мониторинг

### Prometheus Метрики:

- `ani_light_http_requests_total` - Общее количество HTTP запросов
- `ani_light_http_request_duration_seconds` - Время выполнения запросов
- `ani_light_active_connections` - Активные соединения
- `ani_light_cache_operations_total` - Операции с кэшем
- `ani_light_external_api_requests_total` - Запросы к внешним API

### Логи:

```bash
# Просмотр логов в реальном времени
tail -f logs/combined.log

# Только ошибки
tail -f logs/error.log

# Поиск по логам
grep "ERROR" logs/combined.log
```

### Health Checks:

```bash
# Общее состояние
curl http://localhost:3001/health

# Готовность к работе
curl http://localhost:3001/health/ready

# Проверка жизнеспособности
curl http://localhost:3001/health/live

# Внешние зависимости
curl http://localhost:3001/health/external
```

---

## 🚀 Деплой в продакшн

### 1️⃣ Подготовка:

```bash
# Сборка проекта
yarn build

# Проверка тестов
yarn test
yarn test:e2e

# Проверка линтера
yarn lint
```

### 2️⃣ Environment для продакшена:

```env
NODE_ENV=production
JWT_SECRET=super-secure-production-secret
POSTGRES_PASSWORD=secure-production-password
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=warn
```

### 3️⃣ Docker для продакшена:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY dist/ ./dist/
COPY logs/ ./logs/

EXPOSE 3001

CMD ["node", "dist/main"]
```

### 4️⃣ Kubernetes Health Checks:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 📚 Документация

- 📖 **[JWT + Cookies Guide](docs/JWT_COOKIES_GUIDE.md)** - Подробное руководство по аутентификации
- 🏗️ **[Architecture Rules](.cursor/rules/)** - Правила архитектуры и разработки
- 🔧 **[API Documentation](http://localhost:3001/api)** - Swagger документация (в разработке)

---

## 🤝 Разработка

### Структура проекта:

```
src/
├── common/                    # Общие компоненты
│   ├── dto/                  # Общие DTO
│   ├── filters/              # Exception фильтры
│   ├── guards/               # Аутентификация guards
│   ├── interceptors/         # Interceptors
│   └── services/             # Общие сервисы
├── modules/                  # Бизнес модули
│   ├── anime/               # Модуль аниме
│   ├── episode/             # Модуль эпизодов
│   ├── user/                # Модуль пользователей
│   ├── health/              # Health checks
│   └── metrics/             # Prometheus метрики
├── migrations/              # Миграции БД
└── main.ts                  # Точка входа
```

### Правила разработки:

1. **TypeScript Strict Mode** - обязательная типизация
2. **ESLint + Prettier** - единый стиль кода
3. **Unit Tests** - покрытие минимум 80%
4. **TypeORM API** - только TypeORM для миграций
5. **Валидация** - все входящие данные валидируются
6. **Логирование** - все важные операции логируются

### Создание нового модуля:

```bash
# 1. Создать структуру
mkdir -p src/modules/feature-name/{dto,entities}

# 2. Создать файлы
touch src/modules/feature-name/feature.controller.ts
touch src/modules/feature-name/feature.service.ts
touch src/modules/feature-name/feature.module.ts
touch src/modules/feature-name/dto/feature.dto.ts
touch src/modules/feature-name/entities/feature.entity.ts

# 3. Создать тесты
touch src/modules/feature-name/feature.service.spec.ts
touch src/modules/feature-name/feature.controller.spec.ts
```

---

## 🐛 Troubleshooting

### Частые проблемы:

**1. Ошибка подключения к БД:**

```bash
# Проверить статус PostgreSQL
docker-compose ps postgres

# Проверить логи
docker-compose logs postgres

# Пересоздать контейнер
docker-compose down postgres
docker-compose up -d postgres
```

**2. Ошибка Redis:**

```bash
# Проверить Redis
redis-cli ping

# Очистить кэш
redis-cli flushall
```

**3. Ошибки миграций:**

```bash
# Проверить статус миграций
yarn typeorm:show

# Откатить последнюю миграцию
yarn typeorm:down

# Пересоздать миграцию
yarn typeorm:drop
yarn typeorm:up
```

**4. Проблемы с JWT:**

```bash
# Проверить JWT_SECRET в .env
echo $JWT_SECRET

# Очистить cookies в браузере
# Или использовать Incognito режим
```

---

## 📞 Поддержка

- 🐛 **Issues**: Создавайте issue в GitHub
- 📧 **Email**: support@ani-light.com
- 💬 **Discord**: [Ссылка на Discord сервер]
- 📖 **Wiki**: [Ссылка на Wiki]

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

---

<p align="center">
  <strong>Сделано с ❤️ для аниме сообщества</strong>
</p>
