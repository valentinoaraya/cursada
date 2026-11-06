"use client";

import { useState } from "react";
import { AskForm } from "./ask-form";
import { UploadForm } from "./upload-form";

export function StudyWorkspace() {
  const [materia, setMateria] = useState("analisis-de-sistemas");

  return (
    <div className="workspace">
      <UploadForm materia={materia} onMateriaChange={setMateria} />
      <AskForm materia={materia} onMateriaChange={setMateria} />
    </div>
  );
}
