import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) {
      navigate(`/q/${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>Entidades digitales</h1>
        <p>
          Accedé a un perfil escaneando un QR, acercando un tag NFC, o ingresando su código corto acá
          abajo.
        </p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ej: AB123"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Código corto"
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button type="submit" className="btn btn-primary" style={{ width: "auto" }}>
          Buscar
        </button>
      </form>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>¿Cómo funciona?</h2>
        <p>
          Cada código puede representar un equipo, un torneo, un menú, un catálogo, una tarjeta de
          presentación o una identificación de emergencia. Si el código todavía no fue reclamado, vas a
          poder crear una cuenta y asociarlo.
        </p>
      </div>
    </div>
  );
}
