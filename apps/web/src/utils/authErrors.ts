const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Неверный email или пароль",
  EMAIL_TAKEN: "Эта почта уже занята",
  INTERNAL_ERROR: "Что-то пошло не так, попробуйте позже",
  UNAUTHORIZED: "Требуется авторизация"
}

export function mapAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] ?? "Неизвестная ошибка";
}