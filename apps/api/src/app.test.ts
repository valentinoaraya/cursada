import { describe, expect, it } from "vitest";
import type { IngestDocumentInput, IngestResult } from "@cursada/core";
import { buildApp } from "./app.js";

const bytes = new Uint8Array([1, 2, 3, 4]);

function multipartBody(
  parts: Array<{ name: string; value: string | Uint8Array; filename?: string }>,
) {
  const boundary = "----CursadaBoundary";
  const chunks: Buffer[] = [];
  for (const part of parts) {
    const header = part.filename
      ? `Content-Disposition: form-data; name="${part.name}"; filename="${part.filename}"\r\nContent-Type: application/pdf\r\n\r\n`
      : `Content-Disposition: form-data; name="${part.name}"\r\n\r\n`;
    chunks.push(Buffer.from(`--${boundary}\r\n${header}`));
    chunks.push(Buffer.from(part.value));
    chunks.push(Buffer.from("\r\n"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    payload: Buffer.concat(chunks),
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
  };
}

describe("GET /health", () => {
  it("responde ok", async () => {
    const app = buildApp({ logger: false });
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });

    await app.close();
  });
});

describe("POST /documents", () => {
  it("una carga devuelve el resultado del caso de uso y le pasa usuario, materia, unidad, nombre y bytes", async () => {
    const calls: IngestDocumentInput[] = [];
    const result: IngestResult = { documentId: "doc-1", alreadyIndexed: false, chunkCount: 2 };
    const app = buildApp({
      logger: false,
      ingest: {
        async execute(input) {
          calls.push(input);
          return result;
        },
      },
    });
    const body = multipartBody([
      { name: "materia", value: "analisis-de-sistemas" },
      { name: "unidad", value: "1" },
      { name: "file", value: bytes, filename: "apuntes.pdf" },
    ]);

    const response = await app.inject({ method: "POST", url: "/documents", ...body });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(result);
    expect(calls).toEqual([
      {
        userId: "local",
        materia: "analisis-de-sistemas",
        unidad: "1",
        filename: "apuntes.pdf",
        content: bytes,
      },
    ]);

    await app.close();
  });

  it("sin archivo responde 400 y no llama al caso de uso", async () => {
    const calls: IngestDocumentInput[] = [];
    const app = buildApp({
      logger: false,
      ingest: {
        async execute(input) {
          calls.push(input);
          return { documentId: "doc-1", alreadyIndexed: false, chunkCount: 0 };
        },
      },
    });
    const body = multipartBody([
      { name: "materia", value: "analisis-de-sistemas" },
      { name: "unidad", value: "1" },
    ]);

    const response = await app.inject({ method: "POST", url: "/documents", ...body });

    expect(response.statusCode).toBe(400);
    expect(calls).toEqual([]);

    await app.close();
  });
});

describe("POST /questions", () => {
  it("abstención devuelve el aviso y no hace streaming", async () => {
    const app = buildApp({
      logger: false,
      ask: {
        async execute() {
          return { kind: "abstain", notice: "No está en tu material" };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/questions",
      payload: { materia: "analisis-de-sistemas", question: "¿Qué es un sistema?" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ notice: "No está en tu material" });

    await app.close();
  });

  it("respuesta con evidencia hace streaming y cierra con las citas", async () => {
    const app = buildApp({
      logger: false,
      ask: {
        async execute() {
          const stream = async function* () {
            yield "Un sistema ";
            yield "es un conjunto.";
          }();
          return {
            kind: "answer",
            stream,
            citations: [{ filename: "apuntes.pdf", pagina: 2 }],
          };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/questions",
      payload: { materia: "analisis-de-sistemas", question: "¿Qué es un sistema?" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/event-stream");
    expect(response.body).toContain('"token":"Un sistema "');
    expect(response.body).toContain('"citations":[{"filename":"apuntes.pdf","pagina":2}]');
    expect(response.body).toContain("[DONE]");

    await app.close();
  });

  it("sin materia o pregunta responde 400", async () => {
    let calls = 0;
    const app = buildApp({
      logger: false,
      ask: {
        async execute() {
          calls += 1;
          return { kind: "abstain", notice: "No está en tu material" };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/questions",
      payload: { materia: "", question: "hola" },
    });

    expect(response.statusCode).toBe(400);
    expect(calls).toBe(0);

    await app.close();
  });
});
