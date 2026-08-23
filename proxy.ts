import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0].toLowerCase();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-retech-locale", english ? "en" : "id");

  if (host === "admin.retech.id" || host === "admin.localhost") {
    requestHeaders.set("x-retech-admin", "true");
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(adminUrl, { request: { headers: requestHeaders } });
  }

  if (!english) return NextResponse.next({ request: { headers: requestHeaders } });

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(3) || "/";
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|xml|txt)$).*)"],
};
