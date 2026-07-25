'use client'

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { login } from '@/store/slices/authSlice';

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((s: RootState) => s.auth);


  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    dispatch(login({ email, password }));
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="login-email">
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com"/>
      </label>
      <label htmlFor="login-password">
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль"/>
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === 'loading' ? "Входим..." : "Войти"}
      </button>
      <p onClick={onSwitchToRegister}>Нет аккаунта? Зарегистрироваться</p>
    </form>
  )
}