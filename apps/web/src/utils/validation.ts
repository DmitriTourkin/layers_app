export type FieldErrors = Partial<{ email: string; password: string; name: string }>;

function validate(email: string, password: string): Omit<FieldErrors, "name">;
function validate(email: string, password: string, name: string): FieldErrors;
function validate(email: string, password: string, name?: string): FieldErrors {
  const errors: FieldErrors = {}

  if (name !== undefined && !name.trim()) errors.name = "Введите имя пользователя";
  
  if (!email.trim()) {
    errors.email = "Введите email"
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Некорректная почта";
  }

  if (!password) {
    errors.password = "Введите пароль"
  } else if (password.length < 6) {
    errors.password = "Пароль должен состоять минимум из 6 символов";
  }

  return errors;
}

export { validate };