"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type Mode = "reg" | "log";

export function AuthForm({ initialMode } : { initialMode: Mode}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return mode === "log" ? (
    <div>
      <LoginForm onSwitchToRegister={() => setMode("reg")}/>
    </div>
  ) : (
    <div>
      <RegisterForm onSwitchToLogin={() => setMode("log")}/>
    </div>
  );
}