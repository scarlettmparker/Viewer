/**
 * Server-only auth helpers.
 */

import { fetchGraphQLData } from "./api";

/** Name of the httpOnly cookie holding the Gaia JWT. */
export const AUTH_COOKIE = "viewer_auth";

export type Account = {
  id: string;
  username: string;
  personId: string;
  status: string;
};

/**
 * Reads a named cookie value from a raw Cookie header.
 *
 * @param cookieHeader the full Cookie header string
 * @param name the cookie name
 * @returns the decoded value, or undefined if not present
 */
export function getCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(/;\s*/)) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1));
    }
  }
  return undefined;
}

/**
 * Builds the auth token Set-Cookie value.
 *
 * @param token the Gaia JWT
 * @param maxAgeSeconds the cookie lifetime in seconds
 * @returns the Set-Cookie header value
 */
export function buildAuthCookie(
  token: string,
  maxAgeSeconds = 60 * 60 * 12,
): string {
  return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSeconds}`;
}

/** Returns the Set-Cookie value that clears the auth cookie. */
export function clearAuthCookie(): string {
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/**
 * Returns the logged-in account for a JWT.
 *
 * @param token the Gaia JWT
 * @returns the account, or null if invalid or absent
 */
export async function getCurrentUser(
  token: string | undefined,
): Promise<Account | null> {
  if (!token) return null;
  const res = await fetchGraphQLData<{
    gaiaQueries: { me: Account | null };
  }>("gaiaQueries.me", {}, token);
  if (!res.success || !res.data) return null;
  return res.data.gaiaQueries.me ?? null;
}

/**
 * Logs in via Gaia and returns the JWT.
 *
 * @param username the Gaia username
 * @param password the Gaia password
 * @returns the JWT, or null if the credentials were rejected
 */
export async function loginViaGaia(
  username: string,
  password: string,
): Promise<string | null> {
  const res = await fetchGraphQLData<{
    gaiaMutations: { login: { token: string } | null };
  }>("gaiaMutations.login", { input: { username, password } });
  if (!res.success || !res.data) return null;
  return res.data.gaiaMutations.login?.token ?? null;
}
