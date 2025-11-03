# Настройка Telegram бота для авторизации

## Обзор

Telegram бот обеспечивает удобную авторизацию пользователей через кнопки в чате. При нажатии на кнопку пользователь автоматически открывает платформу с авторизацией через Telegram WebApp.

## Архитектура

### Компоненты

1. **TelegramBotModule** - основной модуль для работы с ботом
2. **TelegramBotService** - сервис для обработки команд и кнопок
3. **TelegramBotController** - контроллер для обработки webhook

### Режимы работы

- **Polling** (для разработки) - бот получает обновления через polling
- **Webhook** (для production) - Telegram отправляет обновления на ваш сервер

## Настройка

### 1. Переменные окружения

Добавьте в `.env` файл:

```env
# Токен бота от @BotFather
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Секретный токен для webhook (опционально, для production)
TELEGRAM_BOT_SECRET=your_secret_token_here

# URL фронтенда
FRONTEND_URL=https://your-frontend-domain.com

# Использовать webhook вместо polling (true/false)
TELEGRAM_USE_WEBHOOK=false
```

### 2. Создание бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен в `TELEGRAM_BOT_TOKEN`

### 3. Настройка WebApp (для кнопок)

1. Откройте [@BotFather](https://t.me/botfather)
2. Отправьте команду `/mybots`
3. Выберите вашего бота
4. Выберите "Bot Settings" → "Menu Button"
5. Установите URL вашего фронтенда: `https://your-frontend-domain.com`

Или используйте команду:

```
/setmenubutton
```

Выберите бота и введите URL.

## Использование

### Команды бота

- `/start` - Начать работу с ботом и получить кнопку для авторизации
- `/help` - Показать справку по использованию

### Как это работает

1. Пользователь отправляет команду `/start` боту
2. Бот отправляет сообщение с кнопкой "Открыть платформу"
3. При нажатии на кнопку открывается Telegram WebApp с URL фронтенда
4. Фронтенд получает `initData` из `window.Telegram.WebApp.initData`
5. Фронтенд отправляет `initData` на `/auth/telegram`
6. Пользователь автоматически авторизуется

### Пример интеграции на фронтенде

```javascript
// Проверка, открыто ли приложение из Telegram
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // Получаем initData для авторизации
  const initData = tg.initData;

  // Отправляем на бэкенд для авторизации
  fetch('/auth/telegram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initData: initData,
    }),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Авторизован:', data.user);
      // Пользователь авторизован, можно использовать платформу
    });
}
```

## Webhook (для production)

### Настройка webhook

1. Убедитесь, что `TELEGRAM_USE_WEBHOOK=true`
2. Установите `TELEGRAM_BOT_SECRET` для безопасности
3. Настройте webhook через API Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-backend-domain.com/telegram/webhook",
    "secret_token": "your_secret_token_here"
  }'
```

Или используйте метод бота:

```typescript
await telegramBotService.setWebhook(
  'https://your-backend-domain.com/telegram/webhook',
);
```

### Проверка webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## API Endpoints

### POST /telegram/webhook

Endpoint для получения обновлений от Telegram (только для webhook режима).

**Headers:**

- `X-Telegram-Bot-Api-Secret-Token` - секретный токен (если настроен)

**Body:** Обновление от Telegram в формате JSON

### POST /telegram/info

Endpoint для получения информации о боте (для тестирования).

**Response:**

```json
{
  "status": "active",
  "bot": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Ani-Light Bot",
    "username": "ani_light_bot"
  }
}
```

## Безопасность

1. **Секретный токен webhook** - обязательно используйте в production
2. **Валидация initData** - бэкенд автоматически проверяет подпись данных
3. **Rate limiting** - применяется к эндпоинтам авторизации
4. **HTTPS обязателен** - для работы WebApp нужен HTTPS

## Отладка

### Проверка работы бота

```bash
# Проверить статус бота
curl -X POST http://localhost:3001/telegram/info

# Проверить webhook (если используется)
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Логи

Бот логирует все действия в консоль:

- Инициализация бота
- Обработка команд
- Ошибки при обработке обновлений

## Troubleshooting

### Бот не отвечает

1. Проверьте, что `TELEGRAM_BOT_TOKEN` правильно установлен
2. Проверьте логи приложения
3. Убедитесь, что бот запущен (не в webhook режиме без настроенного webhook)

### Webhook не работает

1. Проверьте, что URL доступен из интернета
2. Убедитесь, что используется HTTPS
3. Проверьте секретный токен
4. Проверьте логи сервера

### Пользователь не авторизуется

1. Проверьте, что фронтенд правильно получает и отправляет `initData`
2. Проверьте URL фронтенда в переменной `FRONTEND_URL`
3. Проверьте логи бэкенда для ошибок валидации

## Дополнительная информация

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp](https://core.telegram.org/bots/webapps)
- [Telegraf Documentation](https://telegraf.js.org/)
