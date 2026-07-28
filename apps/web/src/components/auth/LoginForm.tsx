"use client";

import React, { useState } from "react";
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

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const errors = validate(formValues.email, formValues.password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;
    dispatch(login(formValues));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) =>
      prev[name as keyof InputValues] ? { ...prev, [name]: undefined } : prev,
    );
  }

  return (
    <form id="login-form" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="login-email">Почта</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="name@email.com"
          />
        {fieldErrors.email && (
          <p id="email-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="login-password"></label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Пароль"
        />
        {fieldErrors.password && (
          <p id="password-errro" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>
      {serverErrors && (
        <p id="server-errors" role="alert">
          {serverErrors}
        </p>
      )}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Входим..." : "Войти"}
      </button>
      <p onClick={onSwitchToRegister}>Нет аккаунта? Зарегистрироваться</p>
    </form>
  );
}
