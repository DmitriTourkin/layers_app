"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function PresenceBar() {
  const users = useSelector((s: RootState) => s.presence.users);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-800 bg-gray-900/80 px-3 py-2 shadow-md backdrop-blur-md">
      {users.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white ring-2 ring-gray-900"
        >
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      ))}
    </div>
  );
}
