"use client";

import { useState, type FormEvent } from "react";
import { askQuestion, type AskView } from "../lib/ask-client";
import type { Citation } from "@cursada/contracts";

type AskFormProps = {
  materia: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  notice?: string;
};

export function AskForm({ materia }: AskFormProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (text === "" || materia.trim() === "") {
      return;
    }
    setError(null);
    setStreaming("");
    setQuestion("");
    setPending(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text }]);
    try {
      const view = await askQuestion(
        { materia: materia.trim(), question: text },
        {
          onToken(token) {
            setStreaming((current) => current + token);
          },
        },
      );
      setMessages((current) => [...current, assistantMessage(view)]);
      setStreaming("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "no se pudo preguntar");
      setStreaming("");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="chat" aria-labelledby="ask-title">
      <header className="chat-header">
        <h2 id="ask-title">Preguntas</h2>
        <p className="lede">{materia}</p>
      </header>

      <div className="chat-log" aria-live="polite">
        {messages.length === 0 && !pending ? (
          <p className="chat-empty">Preguntá con tus palabras. Si no está en el material, te avisa sin inventar.</p>
        ) : null}
        {messages.map((message) => (
          <article key={message.id} className={message.role === "user" ? "bubble bubble-user" : "bubble"}>
            <h3>{message.role === "user" ? "Vos" : "Respuesta"}</h3>
            {message.notice ? <p className="notice">{message.notice}</p> : null}
            {message.text ? <p className="answer-text">{message.text}</p> : null}
            {message.citations && message.citations.length > 0 ? (
              <ul className="citations">
                {message.citations.map((citation) => (
                  <li key={`${citation.filename}-${citation.pagina}`}>
                    <span className="cite-file">{citation.filename}</span>
                    <span className="cite-page">p. {citation.pagina}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
        {pending && streaming ? (
          <article className="bubble">
            <h3>Respuesta</h3>
            <p className="answer-text">{streaming}</p>
          </article>
        ) : null}
      </div>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="composer">
        <div className="composer-box">
          <label className="field">
            <span className="sr-only">Pregunta</span>
            <textarea
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
              rows={2}
              disabled={pending}
              placeholder="¿Qué es un sistema?"
            />
          </label>
          <div className="composer-actions">
            <button type="submit" disabled={pending || question.trim() === "" || materia.trim() === ""}>
              {pending ? "Buscando…" : "Preguntar"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function assistantMessage(view: AskView): ChatMessage {
  if (view.kind === "abstain") {
    return { id: crypto.randomUUID(), role: "assistant", text: "", notice: view.notice };
  }
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: view.answer,
    citations: view.citations,
  };
}
