import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { claimEntity, resolveSlug } from "../api/entities";
import { ApiError } from "../api/client";
import { EntityView } from "../components/entity-views";
import { QrCodeCard } from "../components/QrCodeCard";
import { ENTITY_TYPE_LABELS, ENTITY_TYPES, type EntityType, type ResolveResult } from "../types";

export function ResolvePage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState<ResolveResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [entityType, setEntityType] = useState<EntityType>("vcard");
  const [title, setTitle] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    resolveSlug(slug)
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        if (res.entityType) setEntityType(res.entityType);
        if (res.title) setTitle(res.title);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          if (!cancelled) setResult({ exists: false, isClaimed: false, slug });
          return;
        }
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Error de conexión");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleClaim(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/q/${slug}` } });
      return;
    }
    setClaimError(null);
    setIsClaiming(true);
    try {
      const { entity } = await claimEntity({ slug, entityType, title });
      setResult({ exists: true, isClaimed: true, entity });
    } catch (err) {
      setClaimError(err instanceof ApiError ? err.message : "No se pudo reclamar el código");
    } finally {
      setIsClaiming(false);
    }
  }

  if (isLoading) {
    return <div className="page center-note">Cargando...</div>;
  }

  if (loadError) {
    return (
      <div className="page center-note">
        <p className="error-text">{loadError}</p>
      </div>
    );
  }

  if (result?.isClaimed && result.entity) {
    const { entity } = result;
    return (
      <div className="page">
        {!entity.isActive && <span className="badge badge-muted">Inactivo</span>}
        <EntityView entity={entity} />
        {entity.isOwner && (
          <div className="btn-row">
            <Link to={`/entities/${entity.id}/edit`} className="btn btn-primary">
              Editar perfil
            </Link>
          </div>
        )}
        <QrCodeCard url={window.location.href} filename={entity.slug} />
      </div>
    );
  }

  const isTypeLocked = !!result?.entityType;

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>Código «{slug}» disponible</h1>
        <p>
          {result?.exists
            ? "Este código fue provisto pero todavía no fue reclamado por nadie."
            : "Este código todavía no existe. Podés crearlo y reclamarlo ahora."}
        </p>
      </div>

      <form className="card" onSubmit={handleClaim}>
        <h2>Reclamar este código</h2>
        <div className="field">
          <label htmlFor="entityType">Tipo de entidad</label>
          <select
            id="entityType"
            value={entityType}
            disabled={isTypeLocked}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTITY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Deportivo San Martín"
          />
        </div>
        {claimError && <p className="error-text">{claimError}</p>}
        {user ? (
          <button type="submit" className="btn btn-primary" disabled={isClaiming}>
            {isClaiming ? "Reclamando..." : "Reclamar código"}
          </button>
        ) : (
          <button type="submit" className="btn btn-primary">
            Iniciar sesión para reclamar
          </button>
        )}
      </form>
    </div>
  );
}
