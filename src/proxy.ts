// Optimistic redirects only. Real authorization is require*() in pages and actions.
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PREVIEW, ROLE_COOKIE } from "@/lib/auth/roles";

export function proxy(request: NextRequest) {
  if (AUTH_PREVIEW) return NextResponse.next();
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (!role) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (request.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/websites", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/websites/:path*",
    "/support/:path*",
    "/templates/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/portal/:path*",
    "/admin/:path*",
  ],
};
