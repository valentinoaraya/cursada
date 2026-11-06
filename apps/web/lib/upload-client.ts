import { ingestResultSchema, type IngestResultView } from "@cursada/contracts";

export type UploadInput = {
  materia: string;
  unidad: string;
  file: File;
};

export async function uploadDocument(
  input: UploadInput,
  options?: { fetchImpl?: typeof fetch },
): Promise<IngestResultView> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const body = new FormData();
  body.set("materia", input.materia);
  body.set("unidad", input.unidad);
  body.set("file", input.file, input.file.name);

  const response = await fetchImpl("/api/documents", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const parsed = ingestResultSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("respuesta de carga inesperada");
  }
  return parsed.data;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // ignore
  }
  return `la API respondió ${response.status}`;
}
