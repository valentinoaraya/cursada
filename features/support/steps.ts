import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import {
  FakeEmbeddings,
  FakeParser,
  FailingEmbeddings,
  FailingParser,
  type IngestWorld,
} from "./world.ts";

Given("que cargué un documento en una materia", async function (this: IngestWorld) {
  this.parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
  this.embeddings = new FakeEmbeddings();
  this.firstResult = await this.load();
});

Given("un documento con texto en una página", function (this: IngestWorld) {
  this.parser = new FakeParser([{ pagina: 2, text: "Requerimientos." }]);
  this.embeddings = new FakeEmbeddings();
});

Given("que un usuario ya cargó un documento en una materia", async function (this: IngestWorld) {
  this.parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
  this.embeddings = new FakeEmbeddings();
  this.firstResult = await this.load();
});

Given("un documento cuyas páginas no tienen texto", function (this: IngestWorld) {
  this.parser = new FakeParser([{ pagina: 1, text: "" }]);
  this.embeddings = new FakeEmbeddings();
});

Given("un documento que el parser no puede leer", function (this: IngestWorld) {
  this.parser = new FailingParser();
  this.embeddings = new FakeEmbeddings();
});

Given("un documento con texto", function (this: IngestWorld) {
  this.parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
});

Given("un proveedor de embeddings que falla", function (this: IngestWorld) {
  this.embeddings = new FailingEmbeddings();
});

When("vuelvo a cargar el mismo contenido en esa materia", async function (this: IngestWorld) {
  this.lastResult = await this.load();
});

When(
  "vuelvo a cargar el mismo contenido con otro nombre de archivo",
  async function (this: IngestWorld) {
    this.lastResult = await this.load({ filename: "copia-de-apuntes.pdf" });
  },
);

When("lo cargo en una materia y una unidad", async function (this: IngestWorld) {
  this.lastResult = await this.load();
});

When("otro usuario carga el mismo contenido en esa materia", async function (this: IngestWorld) {
  this.lastResult = await this.load({ userId: "user-2" });
});

When("cargo el mismo contenido en otra materia", async function (this: IngestWorld) {
  this.lastResult = await this.load({ materia: "diseno-de-sistemas" });
});

When("lo cargo", async function (this: IngestWorld) {
  this.firstResult = await this.load();
});

When("vuelvo a cargar el mismo contenido", async function (this: IngestWorld) {
  this.lastResult = await this.load();
});

When("intento cargarlo", async function (this: IngestWorld) {
  await this.tryLoad();
});

When(
  "el proveedor de embeddings vuelve a funcionar y lo cargo de nuevo",
  async function (this: IngestWorld) {
    this.embeddings = new FakeEmbeddings();
    this.lastResult = await this.load();
  },
);

Then("el sistema me devuelve el mismo documento", function (this: IngestWorld) {
  assert.equal(this.lastResult?.alreadyIndexed, true);
  assert.equal(this.lastResult?.documentId, this.firstResult?.documentId);
});

Then("no vuelve a parsearlo ni a pedir embeddings", function (this: IngestWorld) {
  assert.equal((this.parser as FakeParser).calls, 1);
  assert.equal((this.embeddings as FakeEmbeddings).calls, 1);
});

Then("no guarda otro lote de chunks", function (this: IngestWorld) {
  assert.equal(this.chunks.savedBatches.length, 1);
});

Then(
  "cada chunk guardado lleva esa materia, esa unidad, ese documento y esa página",
  function (this: IngestWorld) {
    const batch = this.chunks.savedBatches[0];
    assert.equal(batch?.length, 1);
    assert.equal(batch?.[0]?.materia, "analisis-de-sistemas");
    assert.equal(batch?.[0]?.unidad, "1");
    assert.equal(batch?.[0]?.documentId, this.lastResult?.documentId);
    assert.equal(batch?.[0]?.pagina, 2);
  },
);

Then("el sistema lo indexa como un documento nuevo", function (this: IngestWorld) {
  assert.equal(this.lastResult?.alreadyIndexed, false);
  assert.notEqual(this.lastResult?.documentId, this.firstResult?.documentId);
});

Then("no se piden embeddings", function (this: IngestWorld) {
  assert.equal((this.embeddings as FakeEmbeddings | FailingEmbeddings).calls, 0);
});

Then("no se guarda ningún chunk", function (this: IngestWorld) {
  assert.equal(this.chunks.savedBatches[0]?.length ?? 0, 0);
});

Then("el hash queda registrado", function (this: IngestWorld) {
  assert.equal(this.chunks.documents.length, 1);
  assert.equal(this.firstResult?.alreadyIndexed, false);
  assert.equal(this.firstResult?.chunkCount, 0);
});

Then("el sistema no lo vuelve a parsear", function (this: IngestWorld) {
  assert.equal(this.lastResult?.alreadyIndexed, true);
  assert.equal((this.parser as FakeParser).calls, 1);
});

Then("la carga falla", function (this: IngestWorld) {
  assert.ok(this.lastError);
});

Then("no queda documento ni chunk persistido", function (this: IngestWorld) {
  assert.equal(this.chunks.documents.length, 0);
  assert.equal(this.chunks.savedBatches.length, 0);
});

Then("el sistema lo indexa", function (this: IngestWorld) {
  assert.equal(this.lastResult?.alreadyIndexed, false);
  assert.equal(this.lastResult?.chunkCount, 1);
  assert.equal(this.chunks.savedBatches.length, 1);
});
