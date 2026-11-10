"use client";

import { useState, type FormEvent } from "react";
import type { IngestResultView } from "@cursada/contracts";
import { uploadDocument } from "../lib/upload-client";

type UploadFormProps = {
  materia: string;
  unidad: string;
  onUnidadChange: (unidad: string) => void;
};

export function UploadForm({ materia, unidad, onUnidadChange }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IngestResultView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("elegí un PDF o un Markdown");
      return;
    }
    setError(null);
    setResult(null);
    setPending(true);
    try {
      const uploaded = await uploadDocument({
        materia: materia.trim(),
        unidad: unidad.trim(),
        file,
      });
      setResult(uploaded);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "no se pudo cargar");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="upload" aria-labelledby="upload-title">
      <h2 id="upload-title" className="pane-title">
        Material
      </h2>
      <p className="lede">Se carga en {materia}.</p>

      <form onSubmit={onSubmit} className="stack-form">
        <label className="field">
          <span>Unidad</span>
          <input
            name="unidad"
            value={unidad}
            onChange={(event) => onUnidadChange(event.target.value)}
            required
            disabled={pending}
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>Archivo</span>
          <input
            name="file"
            type="file"
            accept=".pdf,.md,application/pdf,text/markdown,text/plain"
            required
            disabled={pending}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button type="submit" className="btn-secondary" disabled={pending || !file || materia.trim() === "" || unidad.trim() === ""}>
          {pending ? "Indexando…" : "Cargar"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <p className="status" role="status">
          {result.alreadyIndexed
            ? "Ya estaba indexado para esa materia."
            : `Indexado: ${result.chunkCount} ${result.chunkCount === 1 ? "fragmento" : "fragmentos"}.`}
        </p>
      ) : null}
    </section>
  );
}
