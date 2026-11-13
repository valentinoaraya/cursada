import { randomUUID } from "node:crypto";
import type { FailedPracticeStore, SaveFailedPracticeInput, ListFailedPracticeInput } from "@cursada/core";
import type { Sql } from "postgres";

export class PgFailedPracticeStore implements FailedPracticeStore {
  constructor(private readonly client: Sql) {}

  async save(input: SaveFailedPracticeInput): Promise<void> {
    await this.client`
      INSERT INTO failed_practice_questions (id, user_id, materia, unidad, question)
      VALUES (${randomUUID()}, ${input.userId}, ${input.materia}, ${input.unidad}, ${input.question})
    `;
  }

  async list(input: ListFailedPracticeInput) {
    const rows = await this.client<{ question: string; unidad: string }[]>`
      SELECT question, unidad
      FROM failed_practice_questions
      WHERE user_id = ${input.userId}
        AND materia = ${input.materia}
      ORDER BY created_at ASC, id ASC
    `;
    return rows.map((row) => ({ question: row.question, unidad: row.unidad }));
  }
}
