export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-900 p-5 shadow-md animate-pulse">
      <div className="h-5 w-2/3 rounded bg-gray-700" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-800" />
    </div>
  );
}
