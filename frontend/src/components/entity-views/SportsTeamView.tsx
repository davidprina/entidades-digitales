import type { SportsTeamPayload } from "../../types";
import { safeHref } from "../../utils/url";

export function SportsTeamView({ title, payload }: { title: string; payload: SportsTeamPayload }) {
  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        {payload.crestUrl && (
          <img
            src={payload.crestUrl}
            alt={`Escudo de ${title}`}
            className="avatar-crest"
            style={{ width: 88, height: 88, margin: "0 auto 12px" }}
          />
        )}
        <h1>{title}</h1>
        {payload.standingsPosition != null && (
          <span className="badge">Posición #{payload.standingsPosition}</span>
        )}
      </div>

      {payload.nextMatch && (
        <div className="card">
          <h2>Próximo partido</h2>
          <p>
            vs. <strong>{payload.nextMatch.opponent ?? "A confirmar"}</strong>
          </p>
          <p>
            {payload.nextMatch.date ?? ""} {payload.nextMatch.venue ? `· ${payload.nextMatch.venue}` : ""}
          </p>
        </div>
      )}

      {!!payload.players?.length && (
        <div className="card">
          <h2>Plantel</h2>
          {payload.players.map((p, i) => (
            <div className="list-item" key={i}>
              <span>
                {p.number != null ? `#${p.number} ` : ""}
                {p.name}
              </span>
              <span className="badge-muted badge">{p.position ?? "-"}</span>
            </div>
          ))}
        </div>
      )}

      {!!payload.staff?.length && (
        <div className="card">
          <h2>Cuerpo técnico</h2>
          {payload.staff.map((s, i) => (
            <div className="list-item" key={i}>
              <span>{s.name}</span>
              <span className="badge-muted badge">{s.role ?? "-"}</span>
            </div>
          ))}
        </div>
      )}

      {payload.socialLinks && Object.keys(payload.socialLinks).length > 0 && (
        <div className="card">
          <h2>Redes</h2>
          <div className="btn-row">
            {Object.entries(payload.socialLinks).map(
              ([name, href]) =>
                safeHref(href) && (
                  <a key={name} href={safeHref(href)} target="_blank" rel="noreferrer" className="btn">
                    {name}
                  </a>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
