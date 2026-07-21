import type { TournamentPayload } from "../../types";

export function TournamentView({ title, payload }: { title: string; payload: TournamentPayload }) {
  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        <h1>{title}</h1>
      </div>

      {!!payload.standings?.length && (
        <div className="card">
          <h2>Tabla de posiciones</h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>PJ</th>
                  <th>G</th>
                  <th>E</th>
                  <th>P</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {payload.standings.map((row, i) => (
                  <tr key={i}>
                    <td>{row.team}</td>
                    <td>{row.played ?? "-"}</td>
                    <td>{row.won ?? "-"}</td>
                    <td>{row.drawn ?? "-"}</td>
                    <td>{row.lost ?? "-"}</td>
                    <td>
                      <strong>{row.points ?? "-"}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!!payload.fixture?.length && (
        <div className="card">
          <h2>Fixture</h2>
          {payload.fixture.map((m, i) => (
            <div className="list-item" key={i}>
              <span>
                {m.homeTeam} vs {m.awayTeam}
              </span>
              <span className="badge-muted badge">
                {m.date ?? ""} {m.time ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {!!payload.topScorers?.length && (
        <div className="card">
          <h2>Goleadores</h2>
          {payload.topScorers
            .slice()
            .sort((a, b) => b.goals - a.goals)
            .map((s, i) => (
              <div className="list-item" key={i}>
                <span>
                  {s.player} {s.team ? `(${s.team})` : ""}
                </span>
                <span className="badge">{s.goals} goles</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
