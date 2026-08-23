import { NextResponse } from "next/server";
import { readAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const session = readAdminSessionFromRequest(request);
  return NextResponse.json(session ? { authenticated: true, email: session.email, expiresAt: session.exp } : { authenticated: false }, { status: session ? 200 : 401 });
}
