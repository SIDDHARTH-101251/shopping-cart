import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export type SessionRole = "admin" | "user";

export const SESSION_COOKIE = "sc_session";
export const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD ?? "yanya";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function parseRole(value: string | undefined): SessionRole | null {
  if (value === "admin" || value === "user") return value;
  if (value === "authenticated") return "user";
  return null;
}

export async function getSessionRoleFromCookies() {
  const store = await cookies();
  return parseRole(store.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticatedFromCookies() {
  return Boolean(await getSessionRoleFromCookies());
}

export function isRequestAuthenticated(req: NextRequest) {
  return Boolean(parseRole(req.cookies.get(SESSION_COOKIE)?.value));
}

export function getRequestRole(req: NextRequest) {
  return parseRole(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(role: SessionRole) {
  const store = await cookies();
  store.set(SESSION_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
