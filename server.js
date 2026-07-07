/**
 * @fileoverview Main entry point for the Fastify server application.
 * Sets up middleware, Vite integration (for development), and routes, then starts the server.
 */

import { createServer } from "@sun/ssr/server";
import {
  port,
  host,
  base,
  isProduction,
  backendHost,
  backendPort,
} from "./config.js";
import { setupRoutes } from "./routes/index.js";

import "./src/utils/register-loaders.ts";
import "./src/utils/configure-framework.ts";

// Parse native form POST bodies (login/logout use PRG so Safari stores the
// httpOnly auth cookie, which it won't for a fetch + JS-redirect).
const configure = async (app) => {
  const { default: formbody } = await import("@fastify/formbody");
  await app.register(formbody);
};

await createServer({
  config: { port, host, base, isProduction, backendHost, backendPort },
  setupRoutes,
  configure,
});
