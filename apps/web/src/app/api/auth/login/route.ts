import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend";

// Защитить от XSS и скрыть токен от браузера, вдруг украдут ☺️
export async function POST(req: NextRequest) {
  const body = await req.text();

  const backResponse = await proxyToBackend("/auth/login", {
    method: "POST",
    body,
  });

  if (backResponse.ok) {
    try {
      const { token, user } = await backResponse.json();
      
      const res = NextResponse.json({ user });
      
      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/"
      });
      
      return res;
    } catch (e) {
      console.error(e);
      throw new Error();
    }
  } else {
    const error = await backResponse.text();

    return new NextResponse(error, {
      status: backResponse.status
    });
  }
}