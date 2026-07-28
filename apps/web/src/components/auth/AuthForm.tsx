"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { AnimatePresence, motion } from "motion/react";

type Mode = "reg" | "log";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("log");

  return (
    <AnimatePresence mode="wait">
      <motion.div
      key={mode}>
        {mode === "log" ? (
          <LoginForm onSwitchToRegister={() => setMode("reg")}/>
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode("log")}/>
        )}
      </motion.div>
    </AnimatePresence>
  );
}