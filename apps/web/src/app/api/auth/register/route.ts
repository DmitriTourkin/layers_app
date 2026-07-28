import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export async function POST(req: NextRequest) {
  return registerHandler(req);
}

async function registerHandler(req: NextRequest) {
  const body = await req.text();

  const response = await proxyToBackend("/auth/register", {
    method: "POST",
    body,
  });

  if (response.ok) {
    try {
      const data = await response.json();

      return NextResponse.json(data, { 
        status: response.status,
      });

    } catch (e) {
      console.error(e);
      throw new Error("Ошибка чтения данных");
    }
  } else {
    const error = await response.text();
    
    return new NextResponse(error, {
      status: response.status
    })
  }
}