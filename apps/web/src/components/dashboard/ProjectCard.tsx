import Link from "next/link";
import type { Project } from "shared";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className="block rounded-2xl bg-gray-900 p-5 shadow-md transition-colors hover:bg-gray-800"
    >
      <h3 className="text-lg font-semibold text-gray-100">{project.name}</h3>
      <p className="mt-1 text-sm text-gray-400">
        {new Date(project.createdAt).toLocaleDateString("ru-RU")}
      </p>
    </Link>
  );
}
