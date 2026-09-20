"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { register } from "@/store/slices/authSlice";
import { FieldErrors, validate } from "@/utils/validation";

type InputValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void}) {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error: serverError } = useSelector((s: RootState) => s.auth);
  const [formValues, setFormValues] = useState<InputValues>({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors = validate(
      formValues.email,
      formValues.password,
      formValues.name,
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    dispatch(register(formValues));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) =>
      prev[name as keyof InputValues] ? { ...prev, [name]: undefined } : prev,
    );
  }

  return (
    <form
      id="register-form"
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-sm mx-auto flex flex-col gap-5 ƒnded-2xl bg-gray-900 p-8 shadow-md"
    >
      <h1 className="text-center text-2xl font-semibold text-gray-100">Регистрация</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-name" className="text-sm font-medium text-gray-300">
          Имя
        </label>
        <input
          id="register-name"
          type="text"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="Имя"
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {fieldErrors.name && (
          <p id="name-error" role="alert" className="text-sm text-red-400">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-gray-300">
          Почта
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="name@mail.com"
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {fieldErrors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-gray-300">
          Пароль
        </label>
        <input
          id="register-password"
          name="password"
          value={formValues.password}
          type="password"
          onChange={handleChange}
          placeholder="Пароль"
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {fieldErrors.password && (
          <p id="password-error" role="alert" className="text-sm text-red-400">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {serverError && (
        <p id="server-error" role="alert" className="text-center text-sm text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Идёт регистрация..." : "Зарегистрироваться"}
      </button>

      <p
        onClick={onSwitchToLogin}
        className="cursor-pointer text-center text-sm text-gray-400 hover:text-blue-400"
      >
        Уже есть аккаунт? Войти
      </p>
    </form>
  );
}
