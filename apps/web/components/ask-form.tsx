"use client";

import { useState, type FormEvent } from "react";
import { askQuestion, type AskView } from "../lib/ask-client";

type AskFormProps = {
  materia: string;
  onMateriaChange: (materia: string) => void;
};

export function AskForm({ materia, onMateriaChange }: AskFormProps) {
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState("");
  const [result, setResult] = useState<AskView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setStreaming("");
    setPending(true);
    try {
      const view = await askQuestion(
        { materia: materia.trim(), question: question.trim() },
        {
          onToken(token) {
            setStreaming((current) => current + token);
          },
        },
      );
      setResult(view);
      if (view.kind === "answer") {
        setStreaming(view.answer);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "no se pudo preguntar");
    } finally {
      setPending(false);
    }
  }

  const answerText = result?.kind === "answer" ? result.answer : streaming;
  const citations = result?.kind === "answer" ? result.citations : [];

  return (
    <section className="panel" aria-labelledby="ask-title">
      <h2 id="ask-title">Preguntá a tu material</h2>
      <p className="lede">
        La respuesta sale de tus apuntes. Si no hay evidencia, te lo dice sin inventar.
      </p>

      <form onSubmit={onSubmit} className="stack-form">
        <label className="field">
          <span>Materia</span>
          <input
            name="materia"
            value={materia}
            onChange={(event) => onMateriaChange(event.target.value)}
            required
            disabled={pending}
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>Pregunta</span>
          <textarea
            name="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
            rows={4}
            disabled={pending}
            placeholder="¿Qué es un sistema?"
          />
        </label>

        <button type="submit" disabled={pending || question.trim() === "" || materia.trim() === ""}>
          {pending ? "Buscando…" : "Preguntar"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {result?.kind === "abstain" ? (
        <p className="notice" role="status">
          {result.notice}
        </p>
      ) : null}

      {answerText ? (
        <article className="answer" aria-live="polite">
          <h3>Respuesta</h3>
          <p className="answer-text">{answerText}</p>
          {citations.length > 0 ? (
            <ul className="citations">
              {citations.map((citation) => (
                <li key={`${citation.filename}-${citation.pagina}`}>
                  {citation.filename}, p. {citation.pagina}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
