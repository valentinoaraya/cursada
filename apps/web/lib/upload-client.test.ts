import { describe, expect, it, vi } from "vitest";
import { uploadDocument } from "./upload-client.js";

describe("uploadDocument", () => {
  it("envía multipart a /api/documents y devuelve el resultado", async () => {
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      const body = init?.body;
      expect(body).toBeInstanceOf(FormData);
      const form = body as FormData;
      expect(form.get("materia")).toBe("analisis-de-sistemas");
      expect(form.get("unidad")).toBe("1");
      const file = form.get("file");
      expect(file).toBeInstanceOf(File);
      expect((file as File).name).toBe("apuntes.pdf");

      return new Response(
        JSON.stringify({ documentId: "doc-1", alreadyIndexed: false, chunkCount: 3 }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });

    const result = await uploadDocument(
      {
        materia: "analisis-de-sistemas",
        unidad: "1",
        file: new File([new Uint8Array([1, 2, 3])], "apuntes.pdf", { type: "application/pdf" }),
      },
      { fetchImpl },
    );

    expect(result).toEqual({
      documentId: "doc-1",
      alreadyIndexed: false,
      chunkCount: 3,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/documents",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("propaga el mensaje de error de la API", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ message: "falta el archivo" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    });

    await expect(
      uploadDocument(
        {
          materia: "analisis-de-sistemas",
          unidad: "1",
          file: new File([new Uint8Array([1])], "apuntes.pdf"),
        },
        { fetchImpl },
      ),
    ).rejects.toThrow("falta el archivo");
  });
});
