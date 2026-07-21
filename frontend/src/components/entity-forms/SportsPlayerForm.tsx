import type { SportsPlayerPayload } from "../../types";

export function SportsPlayerForm({
  payload,
  onChange,
}: {
  payload: Partial<SportsPlayerPayload>;
  onChange: (payload: Partial<SportsPlayerPayload>) => void;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor="photoUrl">Foto (URL)</label>
        <input
          id="photoUrl"
          value={payload.photoUrl ?? ""}
          onChange={(e) => onChange({ ...payload, photoUrl: e.target.value })}
        />
      </div>
      <div className="btn-row">
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="number">Dorsal</label>
          <input
            id="number"
            type="number"
            value={payload.number ?? ""}
            onChange={(e) => onChange({ ...payload, number: Number(e.target.value) })}
          />
        </div>
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="position">Posición</label>
          <input
            id="position"
            value={payload.position ?? ""}
            onChange={(e) => onChange({ ...payload, position: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="medicalNotes">Historial médico rápido</label>
        <textarea
          id="medicalNotes"
          value={payload.medicalNotes ?? ""}
          onChange={(e) => onChange({ ...payload, medicalNotes: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Contacto de emergencia</label>
        <input
          placeholder="Nombre"
          value={payload.emergencyContact?.name ?? ""}
          onChange={(e) =>
            onChange({ ...payload, emergencyContact: { ...payload.emergencyContact, name: e.target.value, phone: payload.emergencyContact?.phone ?? "" } })
          }
          style={{ marginBottom: 8 }}
        />
        <input
          placeholder="Teléfono"
          value={payload.emergencyContact?.phone ?? ""}
          onChange={(e) =>
            onChange({ ...payload, emergencyContact: { ...payload.emergencyContact, phone: e.target.value, name: payload.emergencyContact?.name ?? "" } })
          }
        />
      </div>
    </>
  );
}
