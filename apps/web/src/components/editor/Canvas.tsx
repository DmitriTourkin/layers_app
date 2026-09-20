"use client";

import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Rect, Ellipse, IText, type FabricObject } from "fabric";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { addShape, updateShape, setSelectedShapeId } from "@/store/slices/shapesSlice";
import type { Shape, ShapeType } from "shared";
import type { Tool } from "./Toolbar";

function createFabricObject(shape: Shape): FabricObject {
  const common = {
    left: shape.x,
    top: shape.y,
    width: shape.width,
    height: shape.height,
    angle: shape.rotation,
    fill: shape.fill,
  };

  if (shape.type === "rect") return new Rect(common);
  if (shape.type === "ellipse") {
    return new Ellipse({ ...common, rx: shape.width / 2, ry: shape.height / 2 });
  }
  return new IText("Текст", { left: shape.x, top: shape.y, fill: shape.fill });
}

export function EditorCanvas({ projectId, activeTool }: { projectId: string; activeTool: Tool }) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector((s: RootState) => s.shapes.list);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const objectsRef = useRef<Map<string, FabricObject>>(new Map());

  // activeTool читается внутри обработчика, который навешан один раз при маунте —
  // без ref он бы всегда видел значение на момент создания канваса (stale closure)
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: 1000,
      height: 600,
      backgroundColor: "#18181b",
    });
    fabricCanvasRef.current = canvas;

    canvas.on("mouse:down", (e) => {
      const tool = activeToolRef.current;
      if (tool === "select") return;

      const { x, y } = e.scenePoint;
      const input =
        tool === "text"
          ? { type: "text" as ShapeType, x, y, width: 120, height: 30 }
          : { type: tool as ShapeType, x, y, width: 100, height: 100 };

      dispatch(addShape({ projectId, input }));
    });

    canvas.on("object:modified", (e) => {
      const target = e.target;
      const id = [...objectsRef.current.entries()].find(([, obj]) => obj === target)?.[0];
      if (!id) return;

      dispatch(
        updateShape({
          id,
          input: {
            x: target.left ?? 0,
            y: target.top ?? 0,
            width: (target.width ?? 0) * (target.scaleX ?? 1),
            height: (target.height ?? 0) * (target.scaleY ?? 1),
            rotation: target.angle ?? 0,
          },
        })
      );
    });

    canvas.on("selection:created", (e) => {
      const id = [...objectsRef.current.entries()].find(([, obj]) => obj === e.selected[0])?.[0];
      dispatch(setSelectedShapeId(id ?? null));
    });
    canvas.on("selection:cleared", () => dispatch(setSelectedShapeId(null)));

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [dispatch, projectId]);

  // Redux list -> канвас: добавить новые, убрать удалённые, применить внешние изменения (цвет)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentIds = new Set(list.map((s) => s.id));

    for (const [id, obj] of objectsRef.current) {
      if (!currentIds.has(id)) {
        canvas.remove(obj);
        objectsRef.current.delete(id);
      }
    }

    for (const shape of list) {
      const existing = objectsRef.current.get(shape.id);
      if (!existing) {
        const obj = createFabricObject(shape);
        objectsRef.current.set(shape.id, obj);
        canvas.add(obj);
      } else if (existing.fill !== shape.fill) {
        existing.set({ fill: shape.fill });
      }
    }

    canvas.renderAll();
  }, [list]);

  return <canvas ref={canvasElRef} className="rounded-2xl shadow-md" />;
}
