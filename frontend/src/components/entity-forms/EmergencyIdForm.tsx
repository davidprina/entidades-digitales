import type { EmergencyIdPayload } from "../../types";
import { ArrayEditor } from "../ArrayEditor";

type Contact = EmergencyIdPayload["emergencyContacts"][number];

export function EmergencyIdForm({
  payload,
  onChange,
}: {
  payload: Partial<EmergencyIdPayload>;
  onChange: (payload: Partial<EmergencyIdPayload>) => void;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor="eid-fullName">Nombre (persona o mascota)</label>
        <input
          id="eid-fullName"
          value={payload.fullName ?? ""}
          onChange={(e) => onChange({ ...payload, fullName: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="bloodType">Grupo sanguíneo</label>
        <input
          id="bloodType"
          value={payload.bloodType ?? ""}
          onChange={(e) => onChange({ ...payload, bloodType: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="medicalNotes">Notas médicas</label>
        <textarea
          id="medicalNotes"
          value={payload.medicalNotes ?? ""}
          onChange={(e) => onChange({ ...payload, medicalNotes: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="whatsappNumber">WhatsApp (con código de país)</label>
        <input
          id="whatsappNumber"
          value={payload.whatsappNumber ?? ""}
          onChange={(e) => onChange({ ...payload, whatsappNumber: e.target.value })}
        />
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={payload.rewardOffered ?? false}
            onChange={(e) => onChange({ ...payload, rewardOffered: e.target.checked })}
          />{" "}
          Se ofrece recompensa
        </label>
      </div>

      <div className="field">
        <label>Contactos de emergencia</label>
        <ArrayEditor<Contact>
          items={payload.emergencyContacts ?? []}
          onChange={(emergencyContacts) => onChange({ ...payload, emergencyContacts })}
          emptyItem={{ name: "", phone: "" }}
          addLabel="+ Agregar contacto"
          renderItem={(contact, update) => (
            <>
              <div className="field">
                <label>Nombre</label>
                <input value={contact.name} onChange={(e) => update({ name: e.target.value })} />
              </div>
              <div className="field">
                <label>Teléfono</label>
                <input value={contact.phone} onChange={(e) => update({ phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Relación</label>
                <input
                  value={contact.relationship ?? ""}
                  onChange={(e) => update({ relationship: e.target.value })}
                />
              </div>
            </>
          )}
        />
      </div>
    </>
  );
}
