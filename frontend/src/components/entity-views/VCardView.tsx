import type { VCardPayload } from "../../types";

function buildVcf(payload: VCardPayload): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${payload.fullName}`,
    payload.company ? `ORG:${payload.company}` : "",
    payload.jobTitle ? `TITLE:${payload.jobTitle}` : "",
    payload.phone ? `TEL;TYPE=CELL:${payload.phone}` : "",
    payload.email ? `EMAIL:${payload.email}` : "",
    payload.website ? `URL:${payload.website}` : "",
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\n");
}

export function VCardView({ payload }: { title: string; payload: VCardPayload }) {
  function handleExport() {
    const vcf = buildVcf(payload);
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.fullName || "contacto"}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        <h1>{payload.fullName}</h1>
        {payload.jobTitle && <p>{payload.jobTitle}</p>}
        {payload.company && <p style={{ fontWeight: 600 }}>{payload.company}</p>}
      </div>

      <div className="card">
        <div className="btn-row" style={{ flexDirection: "column" }}>
          {payload.phone && (
            <a href={`tel:${payload.phone}`} className="btn">
              📞 {payload.phone}
            </a>
          )}
          {payload.email && (
            <a href={`mailto:${payload.email}`} className="btn">
              ✉️ {payload.email}
            </a>
          )}
          {payload.website && (
            <a href={payload.website} target="_blank" rel="noreferrer" className="btn">
              🌐 {payload.website}
            </a>
          )}
        </div>
      </div>

      {payload.socialLinks && Object.keys(payload.socialLinks).length > 0 && (
        <div className="card">
          <h2>Redes</h2>
          <div className="btn-row">
            {Object.entries(payload.socialLinks).map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" className="btn">
                {name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Guardar contacto (.vcf)
        </button>
      </div>
    </div>
  );
}
