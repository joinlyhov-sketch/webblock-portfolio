// Shared by proxy.ts and session.ts. Keep this file free of server-only imports.

/** Mock session cookie. Replaced by the real Spring session when the backend exists. */
export const ROLE_COOKIE = "wb_role";

/**
 * TEMPORARY — sign-in isn't built yet. While this is `true`, every page opens without signing in:
 * no cookie means you browse as the mock admin, and role/ownership checks are skipped.
 * Set to `false` once sign-in sets the session. Never active in production builds.
 */
const PREVIEW_WITHOUT_SIGN_IN = true;

export const AUTH_PREVIEW = PREVIEW_WITHOUT_SIGN_IN && process.env.NODE_ENV !== "production";

export type Role = "USER" | "ADMIN";

export function isRole(value: string | undefined): value is Role {
  return value === "USER" || value === "ADMIN";
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
};
