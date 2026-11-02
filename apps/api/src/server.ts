import { buildApp } from "./app.js";
import { createIngestDocument } from "./ingest.js";

const port = Number(process.env.PORT ?? 3001);
const host = "0.0.0.0";

try {
  const ingest = await createIngestDocument(process.env.DATABASE_URL ?? "");
  const app = buildApp({ ingest });
  await app.listen({ port, host });
} catch (error) {
  console.error(error);
  process.exit(1);
}
