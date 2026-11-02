import type { IngestDocumentInput, IngestResult } from "@cursada/core";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance } from "fastify";

export type DocumentIngest = {
  execute(input: IngestDocumentInput): Promise<IngestResult>;
};

const localUserId = "local";

export function buildApp(options?: {
  logger?: boolean;
  ingest?: DocumentIngest;
}): FastifyInstance {
  const app = Fastify({ logger: options?.logger ?? true });

  app.get("/health", async () => ({ status: "ok" }));

  if (options?.ingest) {
    const ingest = options.ingest;
    app.register(multipart);
    app.post("/documents", async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ message: "falta el archivo" });
      }
      const content = new Uint8Array(await file.toBuffer());
      return ingest.execute({
        userId: localUserId,
        materia: textField(file.fields.materia),
        unidad: textField(file.fields.unidad),
        filename: file.filename,
        content,
      });
    });
  }

  return app;
}

function textField(field: { type?: string; value?: unknown } | { type?: string; value?: unknown }[] | undefined): string {
  const single = Array.isArray(field) ? field[0] : field;
  if (!single || single.type !== "field" || typeof single.value !== "string") {
    return "";
  }
  return single.value;
}
