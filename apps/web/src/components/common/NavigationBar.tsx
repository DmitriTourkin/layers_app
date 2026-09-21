"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";

export function NavigationBar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await dispatch(logout());
    router.push("/login");
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="fixed left-1/2 top-4 z-50 flex w-fit -translate-x-1/2 items-center gap-6 rounded-full border border-gray-800 bg-gray-900/80 px-6 py-3 shadow-lg backdrop-blur-md">
      <Link href="/dashboard" className="text-sm font-semibold text-gray-100">
        Layers
      </Link>

      <Link href="/dashboard" className="text-sm text-gray-300 hover:text-blue-400">
        Проекты
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500"
        >
          {initial}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-800 bg-gray-900 p-1 shadow-lg">
            <p className="truncate px-3 py-2 text-xs text-gray-500">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
