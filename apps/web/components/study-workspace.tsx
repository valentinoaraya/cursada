"use client";

import { useState, type FormEvent } from "react";
import { AskForm } from "./ask-form";
import { PracticeForm } from "./practice-form";
import { UploadForm } from "./upload-form";

const initialMateria = "analisis-de-sistemas";

export function StudyWorkspace() {
  const [materias, setMaterias] = useState<string[]>([initialMateria]);
  const [materia, setMateria] = useState(initialMateria);
  const [unidad, setUnidad] = useState("1");
  const [draft, setDraft] = useState("");

  function addMateria(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.trim();
    if (name === "") {
      return;
    }
    setMaterias((current) => (current.includes(name) ? current : [...current, name]));
    setMateria(name);
    setDraft("");
  }

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Materias">
        <p className="brand">
          <svg className="brand-mark" viewBox="0 0 22 22" aria-hidden="true">
            <rect width="22" height="22" rx="6" fill="var(--violet)" />
            <path
              d="M7 5.5h6.2a1.8 1.8 0 0 1 1.8 1.8V16.5l-3.6-2.4-3.6 2.4V7.3A1.8 1.8 0 0 1 7 5.5Z"
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          Cursada
        </p>
        <div className="sidebar-group">
          <h2 className="pane-title">Materias</h2>
          <ul className="materia-list">
            {materias.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={item === materia ? "materia-item is-active" : "materia-item"}
                  onClick={() => setMateria(item)}
                  aria-current={item === materia ? "true" : undefined}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={addMateria} className="stack-form materia-add">
            <label className="field">
              <span>Nueva materia</span>
              <input
                name="nueva-materia"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoComplete="off"
                placeholder="diseno-de-sistemas"
              />
            </label>
            <button type="submit" className="btn-secondary" disabled={draft.trim() === ""}>
              Agregar
            </button>
          </form>
        </div>
        <UploadForm materia={materia} unidad={unidad} onUnidadChange={setUnidad} />
      </aside>

      <AskForm materia={materia} />

      <PracticeForm materia={materia} unidad={unidad} onUnidadChange={setUnidad} />
    </div>
  );
}
