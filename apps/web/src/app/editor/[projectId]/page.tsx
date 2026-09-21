"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchShapes } from "@/store/slices/shapesSlice";
import { Toolbar, type Tool } from "@/components/editor/Toolbar";
import { EditorCanvas } from "@/components/editor/Canvas";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { NavigationBar } from "@/components/common/NavigationBar";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, initialized } = useSelector((s: RootState) => s.auth);
  const [activeTool, setActiveTool] = useState<Tool>("select");

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    } else if (user) {
      dispatch(fetchShapes(projectId));
    }
  }, [dispatch, router, initialized, user, projectId]);

  return (
    <div className="min-h-screen bg-gray-950 p-6 pt-24 text-gray-100">
      <NavigationBar />
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
