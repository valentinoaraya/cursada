"use client";

import { useState } from "react";
import { AskForm } from "./ask-form";
import { PracticeForm } from "./practice-form";
import { UploadForm } from "./upload-form";

export function StudyWorkspace() {
  const [materia, setMateria] = useState("analisis-de-sistemas");
  const [unidad, setUnidad] = useState("1");

  return (
    <div className="workspace">
      <UploadForm
        materia={materia}
        onMateriaChange={setMateria}
        unidad={unidad}
        onUnidadChange={setUnidad}
      />
      <AskForm materia={materia} onMateriaChange={setMateria} />
      <PracticeForm
        materia={materia}
        onMateriaChange={setMateria}
        unidad={unidad}
        onUnidadChange={setUnidad}
      />
    </div>
  );
}
