import Fastify, { type FastifyInstance } from "fastify";

export function buildApp(options?: { logger?: boolean }): FastifyInstance {
  const app = Fastify({ logger: options?.logger ?? true });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
