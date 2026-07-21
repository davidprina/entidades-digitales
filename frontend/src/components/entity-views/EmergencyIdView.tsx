import type { EmergencyIdPayload } from "../../types";

export function EmergencyIdView({ title, payload }: { title: string; payload: EmergencyIdPayload }) {
  const whatsapp = payload.whatsappNumber?.replace(/[^\d]/g, "");

  return (
    <div>
      <div className="emergency-banner">
        <h1>⚠️ {title}</h1>
        {payload.fullName && <p style={{ fontWeight: 600 }}>{payload.fullName}</p>}
        {payload.bloodType && <p>Grupo sanguíneo: {payload.bloodType}</p>}
        {payload.rewardOffered && <span className="badge">Recompensa ofrecida</span>}
      </div>

      {payload.medicalNotes && (
        <div className="card">
          <h2>Notas médicas</h2>
          <p>{payload.medicalNotes}</p>
        </div>
      )}

      <div className="card">
        <h2>Contactos de emergencia</h2>
        {payload.emergencyContacts.map((contact, i) => (
          <div className="list-item" key={i}>
            <span>
              {contact.name} {contact.relationship ? `(${contact.relationship})` : ""}
            </span>
            <a href={`tel:${contact.phone}`} className="btn btn-primary" style={{ width: "auto" }}>
              Llamar
            </a>
          </div>
        ))}
      </div>

      {whatsapp && (
        <div className="btn-row">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
