import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-retech-locale", english ? "en" : "id");

  if (!english) return NextResponse.next({ request: { headers: requestHeaders } });

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(3) || "/";
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|xml|txt)$).*)"],
};
