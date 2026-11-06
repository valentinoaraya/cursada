import { buildApp } from "./app.js";
import { createApiUseCases } from "./ingest.js";

const port = Number(process.env.PORT ?? 3001);
const host = "0.0.0.0";

try {
  const api = await createApiUseCases(process.env.DATABASE_URL ?? "");
  const app = buildApp({ ingest: api.ingest, ask: api.ask });
  await app.listen({ port, host });
} catch (error) {
  console.error(error);
  process.exit(1);
}
