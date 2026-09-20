"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { setSelectedShapeId } from "@/store/slices/shapesSlice";

export function LayersPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, selectedId } = useSelector((s: RootState) => s.shapes);

  return (
    <div className="w-56 rounded-2xl bg-gray-900 p-3 shadow-md">
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Слои</h2>
      <ul className="flex flex-col gap-1">
        {list.map((shape) => (
          <li key={shape.id}>
            <button
              type="button"
              onClick={() => dispatch(setSelectedShapeId(shape.id))}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                selectedId === shape.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {shape.type} — {shape.id.slice(0, 8)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
