"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type Mode = "reg" | "log";

export function AuthForm({ initialMode } : { initialMode: Mode}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      {mode === "log" ? (
        <LoginForm onSwitchToRegister={() => setMode("reg")} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setMode("log")} />
      )}
    </div>
  );
}