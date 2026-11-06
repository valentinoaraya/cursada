import { abstainSchema, citationSchema, type Citation } from "@cursada/contracts";

export type AskInput = {
  materia: string;
  question: string;
};

export type AskView =
  | { kind: "abstain"; notice: "No está en tu material" }
  | { kind: "answer"; answer: string; citations: Citation[] };

export async function askQuestion(
  input: AskInput,
  options?: {
    fetchImpl?: typeof fetch;
    onToken?: (token: string) => void;
  },
): Promise<AskView> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const response = await fetchImpl("/api/questions", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return consumeAskResponse(response, options?.onToken);
}

export async function consumeAskResponse(
  response: Response,
  onToken?: (token: string) => void,
): Promise<AskView> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await response.json();
    const abstain = abstainSchema.safeParse(body);
    if (!abstain.success) {
      throw new Error("respuesta JSON inesperada");
    }
    return { kind: "abstain", notice: abstain.data.notice };
  }

  if (!response.body) {
    throw new Error("respuesta sin cuerpo");
  }

  let answer = "";
  let citations: Citation[] = [];
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const event = parseSseData(part);
      if (event === null) {
        continue;
      }
      if (event === "done") {
        return { kind: "answer", answer, citations };
      }
      if ("token" in event) {
        answer += event.token;
        onToken?.(event.token);
        continue;
      }
      citations = event.citations;
    }
  }

  return { kind: "answer", answer, citations };
}

export function parseSseData(
  block: string,
): { token: string } | { citations: Citation[] } | "done" | null {
  const lines = block
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith("data:"));
  if (lines.length === 0) {
    return null;
  }
  const payload = lines
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n")
    .trim();
  if (payload === "[DONE]") {
    return "done";
  }
  const parsed: unknown = JSON.parse(payload);
  if (parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string") {
    throw new Error(parsed.error);
  }
  if (parsed && typeof parsed === "object" && "token" in parsed && typeof parsed.token === "string") {
    return { token: parsed.token };
  }
  if (parsed && typeof parsed === "object" && "citations" in parsed) {
    const citations = citationSchema.array().safeParse(parsed.citations);
    if (!citations.success) {
      throw new Error("citas inválidas");
    }
    return { citations: citations.data };
  }
  throw new Error("evento SSE inesperado");
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
