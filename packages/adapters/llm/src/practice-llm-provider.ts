import type { PracticeLlmProvider, PracticeVerdict, RetrievedPassage } from "@cursada/core";
import { generateText, type LanguageModel } from "ai";
import { createOllamaChatModel } from "./llm-provider.js";

export class AiSdkPracticeLlmProvider implements PracticeLlmProvider {
  constructor(private readonly model: LanguageModel = createOllamaChatModel()) {}

  async generatePracticeQuestion(input: { passages: RetrievedPassage[] }) {
    const context = formatPassages(input.passages);

    const result = await generateText({
      model: this.model,
      system:
        "Respondé en español. Tu tarea es escribir UNA sola pregunta de examen parcial que se pueda responder usando solo el material provisto. No inventes información fuera de esos pasajes. La pregunta debe ser clara y terminada con signo de interrogación.",
      prompt: `Material:\n${context}\n\nEscribí una sola pregunta de práctica.`,
    });

    return { question: result.text.trim() };
  }

  async gradePracticeAnswer(input: {
    question: string;
    answer: string;
    passages: RetrievedPassage[];
  }) {
    const context = formatPassages(input.passages);

    const result = await generateText({
      model: this.model,
      system:
        "Respondé en español. Evaluá si la respuesta del estudiante es correcta según el material provisto. Tu respuesta debe ser exactamente una de estas dos frases, sin otra palabra antes ni después: «Está bien» o «Fallaste».",
      prompt: `Material:\n${context}\n\nPregunta: ${input.question}\nRespuesta del estudiante: ${input.answer}\n\nVeredicto:`,
    });

    const verdict = parseVerdict(result.text);
    return { verdict };
  }
}

function formatPassages(passages: RetrievedPassage[]) {
  return passages
    .map(
      (passage) => `Archivo: ${passage.filename}, página ${passage.pagina}\n${passage.text}`,
    )
    .join("\n\n---\n\n");
}

function parseVerdict(text: string): PracticeVerdict {
  if (/\bEstá bien\b/.test(text)) {
    return "Está bien";
  }
  if (/\bFallaste\b/.test(text)) {
    return "Fallaste";
  }
  throw new Error("el modelo no devolvió un veredicto reconocible");
}
