import type { SportsPlayerPayload } from "../../types";

export function SportsPlayerView({ title, payload }: { title: string; payload: SportsPlayerPayload }) {
  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        {payload.photoUrl && (
          <img
            src={payload.photoUrl}
            alt={title}
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 12px",
            }}
          />
        )}
        <h1>{title}</h1>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          {payload.number != null && <span className="badge">#{payload.number}</span>}
          {payload.position && <span className="badge badge-muted">{payload.position}</span>}
        </div>
      </div>

      {payload.stats && Object.keys(payload.stats).length > 0 && (
        <div className="card">
          <h2>Estadísticas</h2>
          {Object.entries(payload.stats).map(([key, value]) => (
            <div className="list-item" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      {(payload.medicalNotes || payload.insurance || payload.emergencyContact) && (
        <div className="card">
          <h2>Datos rápidos de emergencia</h2>
          {payload.medicalNotes && <p>{payload.medicalNotes}</p>}
          {payload.insurance && (
            <p>
              Seguro: {payload.insurance.provider ?? "-"}{" "}
              {payload.insurance.policyNumber ? `(póliza ${payload.insurance.policyNumber})` : ""}
            </p>
          )}
          {payload.emergencyContact && (
            <div className="btn-row">
              <a href={`tel:${payload.emergencyContact.phone}`} className="btn btn-primary">
                Llamar a {payload.emergencyContact.name}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
