import { abstainSchema, practiceGradeSchema, practiceQuestionSchema, type Citation } from "@cursada/contracts";

export type PracticeGenerateInput = {
  materia: string;
  unidad: string;
};

export type PracticeGenerateView =
  | { kind: "abstain"; notice: "No está en tu material" }
  | { kind: "question"; question: string };

export async function generatePracticeQuestion(
  input: PracticeGenerateInput,
  options?: { fetchImpl?: typeof fetch },
): Promise<PracticeGenerateView> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const response = await fetchImpl("/api/practice/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  const body: unknown = await response.json();
  const abstain = abstainSchema.safeParse(body);
  if (abstain.success) {
    return { kind: "abstain", notice: abstain.data.notice };
  }
  const parsed = practiceQuestionSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("respuesta de práctica inesperada");
  }
  return { kind: "question", question: parsed.data.question };
}

export type PracticeGradeInput = {
  materia: string;
  unidad: string;
  question: string;
  answer: string;
};

export type PracticeGradeView =
  | { kind: "abstain"; notice: "No está en tu material" }
  | { kind: "graded"; verdict: "Está bien" | "Fallaste"; citations: Citation[] };

export async function gradePracticeAnswer(
  input: PracticeGradeInput,
  options?: { fetchImpl?: typeof fetch },
): Promise<PracticeGradeView> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const response = await fetchImpl("/api/practice/grade", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  const body: unknown = await response.json();
  const abstain = abstainSchema.safeParse(body);
  if (abstain.success) {
    return { kind: "abstain", notice: abstain.data.notice };
  }
  const graded = practiceGradeSchema.safeParse(body);
  if (!graded.success) {
    throw new Error("respuesta de corrección inesperada");
  }
  return {
    kind: "graded",
    verdict: graded.data.verdict,
    citations: graded.data.citations,
  };
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
