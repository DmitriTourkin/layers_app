"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchProjects, createProject } from "@/store/slices/projectsSlice";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectCardSkeleton } from "@/components/dashboard/ProjectCardSkeleton";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { list, status, error } = useSelector((s: RootState) => s.projects);
  const [name, setName] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const project = await dispatch(createProject(name)).unwrap();
      router.push(`/editor/${project.id}`);
    } catch {
      // ошибка уже осела в state.projects.error через createProject.rejected
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-gray-100">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Проекты Layers</h1>

        <form onSubmit={handleCreate} className="mt-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название проекта"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Создать
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {status === "loading"
            ? Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : list.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>

        {status === "idle" && list.length === 0 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Проектов пока нет — создай первый.
          </p>
        )}
      </div>
    </div>
  );
}
