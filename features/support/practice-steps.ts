import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { IngestWorld } from "./world.js";

Given("que cargué material en la unidad uno", function (this: IngestWorld) {
  this.practiceSearchPassages = [
    {
      chunkId: "chunk-u1",
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "1",
      filename: "apuntes.pdf",
      pagina: 2,
      text: "Un sistema es un conjunto de elementos relacionados.",
    },
  ];
  this.practiceGeneratedQuestion = "¿Qué es un sistema según el material?";
});

Given("que esa unidad no tiene material indexado", function (this: IngestWorld) {
  this.practiceSearchPassages = [];
});

Given("pasajes de otra persona o de otra materia o de otra unidad", function (this: IngestWorld) {
  this.practiceSearchPassages = [
    {
      chunkId: "chunk-otro",
      userId: "user-2",
      materia: "analisis-de-sistemas",
      unidad: "1",
      filename: "ajeno.pdf",
      pagina: 1,
      text: "Secreto ajeno.",
    },
    {
      chunkId: "chunk-otra-materia",
      userId: "user-1",
      materia: "ingenieria-de-software",
      unidad: "1",
      filename: "otra-materia.pdf",
      pagina: 1,
      text: "Otra materia.",
    },
    {
      chunkId: "chunk-otra-u",
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "2",
      filename: "u2.pdf",
      pagina: 1,
      text: "Solo unidad 2.",
    },
  ];
});

When("pido practicar la unidad uno", async function (this: IngestWorld) {
  this.practiceGenerateCalls = 0;
  await this.generatePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
  });
});

When("pido practicar una unidad sin material", async function (this: IngestWorld) {
  this.practiceGenerateCalls = 0;
  await this.generatePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "3",
  });
});

When("pido practicar la unidad uno de nuevo", async function (this: IngestWorld) {
  this.practiceQuestionForGrade = "¿Qué es un sistema según el material?";
  this.practiceAnswerForGrade = "Un conjunto de elementos.";
  this.practiceVerdict = "Está bien";
  this.practiceGradeCalls = 0;
  await this.gradePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
    question: this.practiceQuestionForGrade,
    answer: this.practiceAnswerForGrade,
  });
});

When("pido corregir sobre la unidad uno", async function (this: IngestWorld) {
  this.practiceGradeCalls = 0;
  await this.gradePractice({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
    question: "¿Alguna pregunta?",
    answer: "Alguna respuesta.",
  });
});

Then("recibo una pregunta hecha solo con ese material", function (this: IngestWorld) {
  assert.equal(this.lastPracticeGenerateResult?.kind, "question");
  if (this.lastPracticeGenerateResult?.kind !== "question") {
    return;
  }
  assert.equal(this.lastPracticeGenerateResult.question, this.practiceGeneratedQuestion);
  assert.equal(this.practiceGenerateCalls, 1);
});

Then("veo si está bien o si fallé, con el archivo y la página de donde sale la corrección", function (this: IngestWorld) {
  assert.equal(this.lastPracticeGradeResult?.kind, "graded");
  if (this.lastPracticeGradeResult?.kind !== "graded") {
    return;
  }
  assert.equal(this.lastPracticeGradeResult.verdict, "Está bien");
  assert.deepEqual(this.lastPracticeGradeResult.citations, [{ filename: "apuntes.pdf", pagina: 2 }]);
  assert.equal(this.practiceGradeCalls, 1);
});

Then("no recibo una pregunta armada con material ajeno", function (this: IngestWorld) {
  assert.deepEqual(this.lastPracticeGenerateResult, {
    kind: "abstain",
    notice: "No está en tu material",
  });
  assert.equal(this.practiceGenerateCalls, 0);
});

Then("la corrección tampoco usa material ajeno", function (this: IngestWorld) {
  assert.deepEqual(this.lastPracticeGradeResult, {
    kind: "abstain",
    notice: "No está en tu material",
  });
  assert.equal(this.practiceGradeCalls, 0);
});

Then("me avisa {string} y no recibo una pregunta", function (this: IngestWorld, notice: string) {
  assert.deepEqual(this.lastPracticeGenerateResult, { kind: "abstain", notice });
  assert.equal(this.practiceGenerateCalls, 0);
});
