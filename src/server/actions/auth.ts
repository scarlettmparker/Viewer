/**
 * Server-only auth mutation handlers.
 */

import {
  mutationRegistry,
  ServerRedirectError,
  type MutationResult,
} from "@sun/ssr";
import {
  buildAuthCookie,
  clearAuthCookie,
  loginViaGaia,
} from "~/utils/auth";

/**
 * Handles the gaia/login mutation.
 *
 * @param body the username and password
 * @returns StandardError on failure, otherwise throws a redirect
 */
async function handleLogin(
  body: Record<string, unknown>,
): Promise<MutationResult> {
  const username = body.username as string | undefined;
  const password = body.password as string | undefined;

  if (!username || !password) {
    return {
      __typename: "StandardError",
      message: "Missing credentials",
    };
  }

  const token = await loginViaGaia(username, password);
  if (!token) {
    return { __typename: "StandardError", message: "Invalid credentials" };
  }

  throw new ServerRedirectError("/", undefined, undefined, 302, [
    buildAuthCookie(token),
  ]);
}

/** Handles the gaia/logout mutation. */
async function handleLogout(): Promise<MutationResult> {
  throw new ServerRedirectError("/login", undefined, undefined, 302, [
    clearAuthCookie(),
  ]);
}

/**
 * Registers the gaia/login and gaia/logout handlers.
 */
export function registerAuthMutationHandlers(): void {
  mutationRegistry.registerMutationHandler("gaia/login", handleLogin);
  mutationRegistry.registerMutationHandler("gaia/logout", handleLogout);
}
