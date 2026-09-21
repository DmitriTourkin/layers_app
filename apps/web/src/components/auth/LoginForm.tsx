"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { login } from "@/store/slices/authSlice";
import { validate, FieldErrors } from "@/utils/validation";

type InputValues = {
  email: string;
  password: string;
};

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error: serverErrors } = useSelector((s: RootState) => s.auth);
  const [formValues, setFormValues] = useState<InputValues>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const errors = validate(formValues.email, formValues.password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await dispatch(login(formValues)).unwrap();
      router.replace("/dashboard");
    } catch {}
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
      id="login-form"
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-sm mx-auto flex flex-col gap-5 rounded-2xl bg-gray-900 p-8 shadow-md"
    >
      <h1 className="text-center text-2xl font-semibold text-gray-100">Вход</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-gray-300">
          Почта
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="name@email.com"
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {fieldErrors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-gray-300">
          Пароль
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={formValues.password}
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

      {serverErrors && (
        <p id="server-error" role="alert" className="text-center text-sm text-red-400">
          {serverErrors}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Входим..." : "Войти"}
      </button>

      <p
        onClick={onSwitchToRegister}
        className="cursor-pointer text-center text-sm text-gray-400 hover:text-blue-400"
      >
        Нет аккаунта? Зарегистрироваться
      </p>
    </form>
  );
}
