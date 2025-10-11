/**
 * Типы ошибок авторизации
 */
export enum AuthErrorType {
  TOKEN_MISSING = 'TOKEN_MISSING',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
}

/**
 * Сообщения об ошибках авторизации на русском языке
 */
export const AUTH_ERROR_MESSAGES = {
  [AuthErrorType.TOKEN_MISSING]:
    'Для доступа к этому ресурсу необходимо авторизоваться. Пожалуйста, войдите в систему.',
  [AuthErrorType.TOKEN_INVALID]: 'Недействительный токен авторизации',
  [AuthErrorType.TOKEN_EXPIRED]: 'Срок действия токена истек',
  [AuthErrorType.USER_NOT_FOUND]: 'Пользователь не найден',
  [AuthErrorType.USER_INACTIVE]: 'Аккаунт заблокирован',
  [AuthErrorType.INVALID_CREDENTIALS]: 'Неверные учетные данные',
  [AuthErrorType.ACCESS_DENIED]: 'Доступ запрещен',
  [AuthErrorType.SESSION_EXPIRED]: 'Сессия истекла',
} as const;

/**
 * Детальные описания ошибок авторизации
 */
export const AUTH_ERROR_DETAILS = {
  [AuthErrorType.TOKEN_MISSING]:
    'Для доступа к этому ресурсу необходимо авторизоваться. Пожалуйста, войдите в систему.',
  [AuthErrorType.TOKEN_INVALID]:
    'Предоставленный токен авторизации недействителен. Пожалуйста, войдите в систему заново.',
  [AuthErrorType.TOKEN_EXPIRED]:
    'Срок действия вашего токена авторизации истек. Пожалуйста, войдите в систему заново.',
  [AuthErrorType.USER_NOT_FOUND]:
    'Пользователь с указанными данными не найден в системе.',
  [AuthErrorType.USER_INACTIVE]:
    'Ваш аккаунт заблокирован. Обратитесь к администратору для получения помощи.',
  [AuthErrorType.INVALID_CREDENTIALS]:
    'Введенные учетные данные неверны. Проверьте правильность ввода.',
  [AuthErrorType.ACCESS_DENIED]:
    'У вас нет прав для выполнения этого действия.',
  [AuthErrorType.SESSION_EXPIRED]:
    'Ваша сессия истекла. Пожалуйста, войдите в систему заново.',
} as const;
