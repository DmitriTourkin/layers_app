"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { ProjectMember } from "shared";

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "Пользователь с таким email не найден",
  ALREADY_OWNER: "Это владелец проекта",
  FORBIDDEN: "Приглашать может только владелец",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Читатель",
};

export function ShareButton({ projectId }: { projectId: string }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwner = members.find((m) => m.role === "owner")?.id === user?.id;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    fetch(`/api/projects/${projectId}/members`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ProjectMember[]) => {
        if (!cancelled) setMembers(data);
      })
      .catch(() => {});

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      cancelled = true;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, projectId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(ERROR_MESSAGES[data.error] ?? "Не удалось пригласить");
        return;
      }

      setMembers((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      setEmail("");
    } catch {
      setError("Не удалось пригласить");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-gray-800 bg-gray-900/80 px-4 py-2 text-sm font-medium text-gray-200 shadow-md backdrop-blur-md hover:bg-gray-800"
      >
        Поделиться
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-100">Участники проекта</h3>

          <ul className="mt-3 flex flex-col gap-2">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {member.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-100">{member.name}</p>
                  <p className="truncate text-xs text-gray-500">{member.email}</p>
                </div>
                <span className="text-xs text-gray-400">{ROLE_LABELS[member.role]}</span>
              </li>
            ))}
          </ul>

          {isOwner && (
            <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email участника"
                  className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Пригласить
                </button>
              </div>
              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
