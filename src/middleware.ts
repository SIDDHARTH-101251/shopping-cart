import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestRole } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/favicon.ico", "/api/health"];

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const role = getRequestRole(req);
  const isAuthed = Boolean(role);

  if (!isAuthed && isApiRoute && !pathname.startsWith("/api/health")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthed && !isPublic(pathname) && !isApiRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthed && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)", "/api/:path*"],
};
