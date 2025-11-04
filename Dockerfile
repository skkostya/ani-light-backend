# 🐳 Multi-stage Dockerfile для Ani-Light Backend

# 🏗️ Стадия сборки
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем проект
RUN yarn build

# 🚀 Стадия продакшена
FROM node:20-alpine AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем только production зависимости
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Копируем собранное приложение
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Создаем директорию для логов
RUN mkdir -p logs && chown -R nestjs:nodejs logs

# Переключаемся на непривилегированного пользователя
USER nestjs

# Открываем порт
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health/live', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Запускаем приложение
CMD ["node", "dist/main"]
