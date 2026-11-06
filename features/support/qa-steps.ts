import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { IngestWorld } from "./world.js";

Given("que mi material de la materia contiene la respuesta", function (this: IngestWorld) {
  this.searchPassages = [
    {
      chunkId: "chunk-1",
      userId: "user-1",
      materia: "analisis-de-sistemas",
      filename: "apuntes.pdf",
      pagina: 2,
      text: "Un sistema es un conjunto de elementos relacionados.",
    },
  ];
  this.llmAnswer = "Un sistema es un conjunto de elementos.";
  this.llmCitations = [{ filename: "apuntes.pdf", pagina: 2 }];
});

Given("que mi material de la materia no contiene la respuesta", function (this: IngestWorld) {
  this.searchPassages = [];
});

Given("un pasaje de otra persona o mío de otra materia", function (this: IngestWorld) {
  this.searchPassages = [
    {
      chunkId: "chunk-otro",
      userId: "user-2",
      materia: "analisis-de-sistemas",
      filename: "ajeno.pdf",
      pagina: 1,
      text: "Secreto ajeno.",
    },
    {
      chunkId: "chunk-otra-materia",
      userId: "user-1",
      materia: "ingenieria-de-software",
      filename: "otra-materia.pdf",
      pagina: 1,
      text: "Otra materia.",
    },
  ];
});

When("pregunto con mis palabras sobre esa materia", async function (this: IngestWorld) {
  await this.ask({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    question: "¿Qué es un sistema?",
  });
});

When("pregunto sobre esa materia", async function (this: IngestWorld) {
  await this.ask({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    question: "¿Qué es un sistema?",
  });
});

When("pregunto sobre esta materia", async function (this: IngestWorld) {
  await this.ask({
    userId: "user-1",
    materia: "analisis-de-sistemas",
    question: "¿Qué es un sistema?",
  });
});

Then("veo la respuesta mientras se escribe", async function (this: IngestWorld) {
  assert.equal(this.lastAskResult?.kind, "answer");
  if (this.lastAskResult?.kind !== "answer") {
    return;
  }
  const text = await this.readStream(this.lastAskResult.stream);
  assert.equal(text, this.llmAnswer);
});

Then("la respuesta cita el archivo y la página de donde sale", function (this: IngestWorld) {
  assert.equal(this.lastAskResult?.kind, "answer");
  if (this.lastAskResult?.kind !== "answer") {
    return;
  }
  assert.deepEqual(this.lastAskResult.citations, [{ filename: "apuntes.pdf", pagina: 2 }]);
});

Then("me avisa {string}", function (this: IngestWorld, notice: string) {
  assert.deepEqual(this.lastAskResult, { kind: "abstain", notice });
});

Then("no me da una respuesta generada", function (this: IngestWorld) {
  assert.equal(this.llmCalls, 0);
});

Then("la respuesta no lo cita ni lo usa", function (this: IngestWorld) {
  assert.deepEqual(this.lastAskResult, { kind: "abstain", notice: "No está en tu material" });
  assert.equal(this.llmCalls, 0);
});
