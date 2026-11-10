"use client";

import { useState, type FormEvent } from "react";
import { generatePracticeQuestion, gradePracticeAnswer, type PracticeGradeView } from "../lib/practice-client";

type PracticeFormProps = {
  materia: string;
  unidad: string;
  onUnidadChange: (unidad: string) => void;
};

export function PracticeForm({ materia, unidad, onUnidadChange }: PracticeFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generateResult, setGenerateResult] = useState<
    { kind: "abstain"; notice: string } | { kind: "question"; text: string } | null
  >(null);
  const [gradeResult, setGradeResult] = useState<PracticeGradeView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [pendingGrade, setPendingGrade] = useState(false);

  async function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setGenerateResult(null);
    setGradeResult(null);
    setQuestion("");
    setAnswer("");
    setPendingGenerate(true);
    try {
      const view = await generatePracticeQuestion({
        materia: materia.trim(),
        unidad: unidad.trim(),
      });
      if (view.kind === "abstain") {
        setGenerateResult({ kind: "abstain", notice: view.notice });
        return;
      }
      setGenerateResult({ kind: "question", text: view.question });
      setQuestion(view.question);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "no se pudo generar la pregunta");
    } finally {
      setPendingGenerate(false);
    }
  }

  async function onGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setGradeResult(null);
    setPendingGrade(true);
    try {
      const view = await gradePracticeAnswer({
        materia: materia.trim(),
        unidad: unidad.trim(),
        question: question.trim(),
        answer: answer.trim(),
      });
      setGradeResult(view);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "no se pudo corregir");
    } finally {
      setPendingGrade(false);
    }
  }

  const canGrade = question.trim() !== "" && answer.trim() !== "";

  return (
    <section className="practice" aria-labelledby="practice-title">
      <h2 id="practice-title" className="pane-title">
        Práctica
      </h2>
      <p className="lede">Una pregunta de la unidad, y la corrección contra la fuente.</p>

      <form onSubmit={onGenerate} className="stack-form">
        <label className="field">
          <span>Unidad</span>
          <input
            name="unidad"
            value={unidad}
            onChange={(event) => onUnidadChange(event.target.value)}
            required
            disabled={pendingGenerate || pendingGrade}
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          className="btn-secondary"
          disabled={pendingGenerate || pendingGrade || materia.trim() === "" || unidad.trim() === ""}
        >
          {pendingGenerate ? "Generando…" : "Generar pregunta"}
        </button>
      </form>

      {generateResult?.kind === "abstain" ? (
        <p className="notice" role="status">
          {generateResult.notice}
        </p>
      ) : null}

      {generateResult?.kind === "question" ? (
        <article className="answer" aria-live="polite">
          <h3>Pregunta</h3>
          <p className="answer-text">{generateResult.text}</p>
        </article>
      ) : null}

      <form onSubmit={onGrade} className="stack-form">
        <label className="field">
          <span>Tu respuesta</span>
          <textarea
            name="answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            required
            rows={4}
            disabled={pendingGrade || question.trim() === ""}
            placeholder="Escribí aquí lo que recordás…"
          />
        </label>

        <button type="submit" disabled={pendingGrade || !canGrade}>
          {pendingGrade ? "Corrigiendo…" : "Corregir"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {gradeResult?.kind === "abstain" ? (
        <p className="notice" role="status">
          {gradeResult.notice}
        </p>
      ) : null}

      {gradeResult?.kind === "graded" ? (
        <article className="answer" aria-live="polite">
          <h3>Corrección</h3>
          <p className="answer-text">{gradeResult.verdict}</p>
          {gradeResult.citations.length > 0 ? (
            <ul className="citations">
              {gradeResult.citations.map((citation) => (
                <li key={`${citation.filename}-${citation.pagina}`}>
                  <span className="cite-file">{citation.filename}</span>
                  <span className="cite-page">p. {citation.pagina}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
