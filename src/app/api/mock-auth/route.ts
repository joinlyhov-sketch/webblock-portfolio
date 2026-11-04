// Mock sign-in: sets the "wb_role" session cookie. A Route Handler, not a Server Action, because
// sign-in runs before there is a user to require(). Replaced by the Spring login when the backend exists.
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/next-path";
import { ROLE_COOKIE, isRole } from "@/lib/auth/roles";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const role = form?.get("role")?.toString();

  // Resolve external browser host and protocol (e.g. behind Kubernetes Ingress)
  // instead of the container's internal binding address (0.0.0.0).
  const rawHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const host = rawHost.split(",")[0].trim();
  const rawProto = request.headers.get("x-forwarded-proto") ?? "http";
  const proto = rawProto.split(",")[0].trim();
  const origin = `${proto}://${host}`;

  if (!isRole(role)) {
    return NextResponse.redirect(new URL("/sign-in", origin), 303);
  }

  // Back to the page that asked for sign-in (`?next=`), else the role's home.
  // When entering as ADMIN, default to /admin even if ?next was set to /websites by an unauthenticated redirect.
  const next = safeNextPath(form?.get("next")?.toString());
  const home = role === "ADMIN" && (!next || next === "/websites") ? "/admin" : (next ?? "/websites");

  const response = NextResponse.redirect(new URL(home, origin), 303);
  response.cookies.set(ROLE_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax" });
  return response;
}
