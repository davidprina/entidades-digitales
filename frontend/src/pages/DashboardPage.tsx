import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyEntities } from "../api/entities";
import { ENTITY_TYPE_LABELS, type PublicEntity } from "../types";

export function DashboardPage() {
  const [entities, setEntities] = useState<PublicEntity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyEntities()
      .then((res) => setEntities(res.entities))
      .catch(() => setError("No se pudieron cargar tus entidades"));
  }, []);

  return (
    <div className="page">
      <h1>Mis entidades</h1>

      <div className="btn-row">
        <Link to="/entities/new" className="btn btn-primary">
          + Crear nueva entidad
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      {entities && entities.length === 0 && (
        <p className="center-note">Todavía no reclamaste ni creaste ninguna entidad.</p>
      )}

      {entities?.map((entity) => (
        <div className="card list-item" key={entity.id}>
          <div>
            <div style={{ fontWeight: 600 }}>{entity.title}</div>
            <span className="badge badge-muted">{ENTITY_TYPE_LABELS[entity.entityType]}</span>
            {!entity.isActive && <span className="badge badge-muted">Inactivo</span>}
          </div>
          <div className="btn-row" style={{ width: "auto" }}>
            <Link to={`/q/${entity.slug}`} className="btn" style={{ width: "auto" }}>
              Ver
            </Link>
            <Link to={`/entities/${entity.id}/edit`} className="btn btn-primary" style={{ width: "auto" }}>
              Editar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
