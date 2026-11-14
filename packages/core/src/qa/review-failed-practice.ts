import type { FailedPracticeStore } from "./ports.js";
import type { ReviewFailedPracticeInput, ReviewFailedPracticeResult } from "./types.js";

export class ReviewFailedPractice {
  constructor(private readonly failed: FailedPracticeStore) {}

  async execute(input: ReviewFailedPracticeInput): Promise<ReviewFailedPracticeResult> {
    const materia = input.materia.trim();
    if (materia === "") {
      return { questions: [] };
    }

    const questions = await this.failed.list({
      userId: input.userId,
      materia,
    });
    return { questions };
  }
}
