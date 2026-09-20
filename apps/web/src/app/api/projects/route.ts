import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const response = await proxyToBackend("/projects", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.text();

  const response = await proxyToBackend("/projects", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
