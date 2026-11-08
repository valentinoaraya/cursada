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
        <p className="brand">Cursada</p>
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
          <button type="submit" disabled={draft.trim() === ""}>
            Agregar
          </button>
        </form>
        <UploadForm materia={materia} unidad={unidad} onUnidadChange={setUnidad} />
      </aside>

      <AskForm materia={materia} />

      <PracticeForm materia={materia} unidad={unidad} onUnidadChange={setUnidad} />
    </div>
  );
}
