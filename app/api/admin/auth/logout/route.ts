import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAllowedAdminHost, isAllowedAdminOrigin, readAdminSessionFromRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAllowedAdminHost(request.headers.get("host") || request.headers.get("x-forwarded-host")) || !isAllowedAdminOrigin(request.headers.get("origin")) || !readAdminSessionFromRequest(request, true)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
