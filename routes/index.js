/**
 * @fileoverview Defines and sets up all application routes.
 * @module routes
 */
import { renderApp } from "../utils/ssr.js";
import { base, isProduction } from "../config.js";
import { Buffer } from "buffer";
import { AUTH_COOKIE, getCookieValue, getCurrentUser } from "../src/utils/auth.ts";

/** Pages that do not require an authenticated Gaia session. */
const PUBLIC_PAGES = new Set(["/login"]);

/** Strips a trailing slash (except for the root). */
function normalizePath(pathname) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.replace(/\/+$/, "")
    : pathname;
}

/**
 * Sets up routes for the Fastify application: the SSR catch-all and its Gaia
 * auth gate. Login, logout, and credential minting are handled by the @sun/ssr
 * mutation and page-data pipelines.
 *
 * @param {import("fastify").FastifyInstance} app - The Fastify application instance.
 * @param {object} vite - The Vite dev server instance (optional, only in development).
 */
export function setupRoutes(app, vite) {
  /**
   * Catch-all route for server-side rendering of pages, gated on a Gaia session.
   */
  app.setNotFoundHandler({ method: ["GET"] }, async (request, reply) => {
    const requestUrl = new URL(request.raw.url, "http://localhost");
    const pathname = normalizePath(requestUrl.pathname);

    // Skip static assets.
    if (/\.[^/]+$/.test(pathname)) {
      return reply.callNotFound();
    }

    const token = getCookieValue(request.headers.cookie, AUTH_COOKIE);
    const user = await getCurrentUser(token);
    const isPublic = PUBLIC_PAGES.has(pathname);

    if (!user && !isPublic) {
      return reply.redirect("/login");
    }
    if (user && isPublic) {
      return reply.redirect("/");
    }

    const mutationPayloadCookie = getCookieValue(
      request.headers.cookie,
      "mutation_payload",
    );
    const invalidateCacheCookie = getCookieValue(
      request.headers.cookie,
      "invalidate_cache",
    );
    let mutationPayload = null;
    if (mutationPayloadCookie) {
      try {
        mutationPayload = JSON.parse(
          Buffer.from(mutationPayloadCookie, "base64").toString("utf-8"),
        );
      } catch (_) {
        // Do nothing
      }
    }

    let url = pathname.replace(base, "");
    if (!url.startsWith("/")) url = "/" + url;
    if (requestUrl.search) url += requestUrl.search;

    const langHeader = request.headers["accept-language"] || "en";
    const locale = langHeader.split(",")[0] || "en";

    const pageName = url.split("/")[1] || "home";

    try {
      await renderApp(
        {
          vite,
          isProduction,
          url,
          locale,
          pageName,
          user,
          mutationPayload,
          invalidateCacheCookie,
        },
        reply.raw,
      );
    } catch (e) {
      console.error("Error during route handling:", e);
      reply.status(500).send("Internal Server Error: " + e.message);
    }
  });
}