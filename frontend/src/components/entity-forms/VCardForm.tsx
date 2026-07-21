import type { VCardPayload } from "../../types";

export function VCardForm({
  payload,
  onChange,
}: {
  payload: Partial<VCardPayload>;
  onChange: (payload: Partial<VCardPayload>) => void;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor="fullName">Nombre completo</label>
        <input
          id="fullName"
          required
          value={payload.fullName ?? ""}
          onChange={(e) => onChange({ ...payload, fullName: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="jobTitle">Cargo</label>
        <input
          id="jobTitle"
          value={payload.jobTitle ?? ""}
          onChange={(e) => onChange({ ...payload, jobTitle: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="company">Empresa</label>
        <input
          id="company"
          value={payload.company ?? ""}
          onChange={(e) => onChange({ ...payload, company: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          value={payload.phone ?? ""}
          onChange={(e) => onChange({ ...payload, phone: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="vc-email">Email</label>
        <input
          id="vc-email"
          type="email"
          value={payload.email ?? ""}
          onChange={(e) => onChange({ ...payload, email: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="website">Sitio web</label>
        <input
          id="website"
          value={payload.website ?? ""}
          onChange={(e) => onChange({ ...payload, website: e.target.value })}
        />
      </div>
    </>
  );
}
