"use client";

export type Tool = "select" | "rect" | "ellipse" | "text";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "select", label: "Курсор" },
  { id: "rect", label: "Прямоугольник" },
  { id: "ellipse", label: "Эллипс" },
  { id: "text", label: "Текст" },
];

export function Toolbar({
  activeTool,
  onSelectTool,
}: {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
}) {
  return (
    <div className="flex gap-2 rounded-xl bg-gray-900 p-2 shadow-md">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => onSelectTool(tool.id)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTool === tool.id
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-gray-800"
          }`}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
