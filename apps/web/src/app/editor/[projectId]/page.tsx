"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchShapes } from "@/store/slices/shapesSlice";
import { Toolbar, type Tool } from "@/components/editor/Toolbar";
import { EditorCanvas } from "@/components/editor/Canvas";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTool, setActiveTool] = useState<Tool>("select");

  useEffect(() => {
    dispatch(fetchShapes(projectId));
  }, [dispatch, projectId]);

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-gray-100">
      <div className="mb-4 flex justify-center">
        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      </div>

      <div className="flex justify-center gap-4">
        <LayersPanel />
        <EditorCanvas projectId={projectId} activeTool={activeTool} />
        <PropertiesPanel />
      </div>
    </div>
  );
}
