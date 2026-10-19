"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { renameProject, deleteProject } from "@/store/slices/projectsSlice";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { Project } from "shared";

export function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuPosition) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPosition(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuPosition]);

  function openEditor() {
    if (!isEditing) router.push(`/editor/${project.id}`);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  }

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== project.name) {
      dispatch(renameProject({ id: project.id, name: trimmed }));
    }
    setIsEditing(false);
  }

  function handleConfirmDelete() {
    dispatch(deleteProject(project.id));
    setConfirmingDelete(false);
  }

  return (
    <>
      <div
        onClick={openEditor}
        onContextMenu={handleContextMenu}
        className="cursor-pointer rounded-2xl bg-gray-900 p-5 shadow-md transition-colors hover:bg-gray-800"
      >
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsEditing(false);
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-lg font-semibold text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        ) : (
          <h3 className="text-lg font-semibold text-gray-100">{project.name}</h3>
        )}

        <p className="mt-1 text-sm text-gray-400">
          {new Date(project.createdAt).toLocaleDateString("ru-RU")}
        </p>
      </div>

      {menuPosition && (
        <div
          ref={menuRef}
          style={{ top: menuPosition.y, left: menuPosition.x }}
          className="fixed z-50 w-52 rounded-xl border border-gray-800 bg-gray-900 p-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => {
              setDraftName(project.name);
              setIsEditing(true);
              setMenuPosition(null);
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
          >
            Переименовать проект
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmingDelete(true);
              setMenuPosition(null);
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
          >
            Удалить проект
          </button>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmModal
          title="Удалить проект?"
          message={`Проект "${project.name}" будет удалён без возможности восстановления.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
