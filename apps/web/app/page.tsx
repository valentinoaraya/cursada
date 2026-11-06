import { StudyWorkspace } from "../components/study-workspace";

export default function HomePage() {
  return (
    <main>
      <h1 className="brand">Cursada</h1>
      <p className="tagline">
        Cargá tus apuntes y preguntá con tus palabras. Si está en tu material, ves la respuesta
        mientras se escribe, con archivo y página. Si no, te avisa sin inventar.
      </p>
      <StudyWorkspace />
    </main>
  );
}
