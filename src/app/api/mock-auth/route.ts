// Mock sign-in: sets the "wb_role" session cookie. A Route Handler, not a Server Action, because
// sign-in runs before there is a user to require(). Replaced by the Spring login when the backend exists.
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, isRole } from "@/lib/auth/roles";

export async function POST(request: NextRequest) {
  const role = (await request.formData()).get("role")?.toString();
  if (!isRole(role)) {
    return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  }
  const home = role === "ADMIN" ? "/admin" : "/websites";
  const response = NextResponse.redirect(new URL(home, request.url), 303);
  response.cookies.set(ROLE_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax" });
  return response;
}
