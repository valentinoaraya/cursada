import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { IngestWorld } from "./world.js";

When("fallo una pregunta de esa unidad", async function (this: IngestWorld) {
  this.practiceVerdict = "Fallaste";
  this.practiceQuestionForGrade = "¿Qué es un sistema según el material?";
  await this.gradePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
    question: this.practiceQuestionForGrade,
    answer: "No me acuerdo.",
  });
});

When("acierto una pregunta de esa unidad", async function (this: IngestWorld) {
  this.practiceVerdict = "Está bien";
  this.practiceQuestionForGrade = "¿Qué es un sistema según el material?";
  await this.gradePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
    question: this.practiceQuestionForGrade,
    answer: "Un conjunto de elementos.",
  });
});

Given("que otra persona falló una pregunta de la materia", async function (this: IngestWorld) {
  await this.failedPractice.save({
    userId: "user-2",
    materia: "analisis-de-sistemas",
    unidad: "1",
    question: "Pregunta ajena",
  });
});

When("pido repasar esa materia", async function (this: IngestWorld) {
  await this.reviewFailed({
    userId: "user-1",
    materia: "analisis-de-sistemas",
  });
});

Then("veo esa pregunta en el repaso", function (this: IngestWorld) {
  assert.deepEqual(this.lastReviewResult, {
    questions: [{ question: "¿Qué es un sistema según el material?", unidad: "1" }],
  });
});

Then("esa pregunta no aparece en el repaso", function (this: IngestWorld) {
  assert.deepEqual(this.lastReviewResult, { questions: [] });
});

Then("no veo la pregunta de esa persona", function (this: IngestWorld) {
  assert.deepEqual(this.lastReviewResult, { questions: [] });
});
