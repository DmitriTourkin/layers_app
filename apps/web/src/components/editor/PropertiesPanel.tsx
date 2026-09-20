"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { updateShape, removeShape, setSelectedShapeId } from "@/store/slices/shapesSlice";

export function PropertiesPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, selectedId } = useSelector((s: RootState) => s.shapes);
  const selected = list.find((s) => s.id === selectedId);

  if (!selected) {
    return (
      <div className="w-56 rounded-2xl bg-gray-900 p-3 shadow-md">
        <p className="text-sm text-gray-500">Ничего не выбрано</p>
      </div>
    );
  }

  function handleDelete() {
    dispatch(removeShape(selected!.id));
    dispatch(setSelectedShapeId(null));
  }

  return (
    <div className="w-56 rounded-2xl bg-gray-900 p-3 shadow-md">
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Свойства</h2>

      <label className="block text-xs text-gray-400">Цвет заливки</label>
      <input
        type="color"
        value={selected.fill}
        onChange={(e) =>
          dispatch(updateShape({ id: selected.id, input: { fill: e.target.value } }))
        }
        className="mt-1 h-8 w-full cursor-pointer rounded"
      />

      <button
        type="button"
        onClick={handleDelete}
        className="mt-4 w-full rounded-lg bg-red-600 py-1.5 text-sm text-white hover:bg-red-500"
      >
        Удалить
      </button>
    </div>
  );
}
