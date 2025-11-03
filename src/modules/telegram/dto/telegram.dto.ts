/**
 * Данные пользователя из Telegram Mini App
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Верифицированные данные из Telegram Mini App (initData)
 */
export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

/**
 * Данные чата из Telegram Mini App
 */
export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

