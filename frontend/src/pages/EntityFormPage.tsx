import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEntity, deleteEntity, getMyEntity, updateEntity } from "../api/entities";
import { ApiError } from "../api/client";
import { FORM_BY_TYPE } from "../components/entity-forms";
import { ENTITY_TYPE_LABELS, ENTITY_TYPES, type EntityType } from "../types";

export function EntityFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [entityType, setEntityType] = useState<EntityType>("vcard");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [payload, setPayload] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !id) return;
    getMyEntity(id)
      .then(({ entity }) => {
        setEntityType(entity.entityType);
        setTitle(entity.title);
        setSlug(entity.slug);
        setPayload(entity.payload);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError && err.status === 403
            ? "No tenés permiso para editar esta entidad"
            : "No se encontró la entidad",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [id, isEditing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateEntity(id, { title, payload });
      } else {
        const { entity } = await createEntity({
          entityType,
          title,
          payload,
          ...(slug.trim() && { slug: slug.trim() }),
        });
        navigate(`/q/${entity.slug}`);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("¿Seguro que querés eliminar esta entidad? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteEntity(id);
      navigate("/dashboard");
    } catch {
      setError("No se pudo eliminar");
    }
  }

  if (isLoading) {
    return <div className="page center-note">Cargando...</div>;
  }

  const Form = FORM_BY_TYPE[entityType];

  return (
    <div className="page">
      <h1>{isEditing ? "Editar entidad" : "Crear nueva entidad"}</h1>

      <form className="card" onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="field">
            <label htmlFor="entityType">Tipo de entidad</label>
            <select
              id="entityType"
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityType);
                setPayload({});
              }}
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENTITY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        )}

        {isEditing && <span className="badge badge-muted">{ENTITY_TYPE_LABELS[entityType]}</span>}

        <div className="field">
          <label htmlFor="title">Título</label>
          <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {!isEditing && (
          <div className="field">
            <label htmlFor="slug">Código corto (opcional, se genera uno si lo dejás vacío)</label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ej: mi-negocio"
            />
          </div>
        )}

        <Form payload={payload as never} onChange={(p: never) => setPayload(p)} />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {isEditing && (
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          Eliminar entidad
        </button>
      )}
    </div>
  );
}
