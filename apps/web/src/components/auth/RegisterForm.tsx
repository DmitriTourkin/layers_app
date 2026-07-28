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
    <form id="register-form" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="register-name">Имя</label>
        <input
          id="register-name"
          type="text"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="Имя"
        />
        {fieldErrors.name && (
          <p id="name-error" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-email">Почта</label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="name@mail.com"
        />
        {fieldErrors.email && (
          <p id="email-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-password">Пароль</label>
        <input
          id="register-password"
          name="password"
          value={formValues.password}
          type="password"
          onChange={handleChange}
          placeholder="Пароль"
        />
        {fieldErrors.password && (
          <p id="password-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>
      {serverError && (
        <p id="server-error" role="alert">
          {serverError}
        </p>
      )}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Идёт регистрация..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}
