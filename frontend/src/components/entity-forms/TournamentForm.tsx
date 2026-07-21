import type { TournamentPayload } from "../../types";
import { ArrayEditor } from "../ArrayEditor";

type Standing = NonNullable<TournamentPayload["standings"]>[number];
type Match = NonNullable<TournamentPayload["fixture"]>[number];
type Scorer = NonNullable<TournamentPayload["topScorers"]>[number];

export function TournamentForm({
  payload,
  onChange,
}: {
  payload: Partial<TournamentPayload>;
  onChange: (payload: Partial<TournamentPayload>) => void;
}) {
  return (
    <>
      <div className="field">
        <label>Tabla de posiciones</label>
        <ArrayEditor<Standing>
          items={payload.standings ?? []}
          onChange={(standings) => onChange({ ...payload, standings })}
          emptyItem={{ team: "" }}
          addLabel="+ Agregar equipo"
          renderItem={(row, update) => (
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <input placeholder="Equipo" value={row.team} onChange={(e) => update({ team: e.target.value })} />
              <input
                type="number"
                placeholder="PJ"
                value={row.played ?? ""}
                onChange={(e) => update({ played: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="G"
                value={row.won ?? ""}
                onChange={(e) => update({ won: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Pts"
                value={row.points ?? ""}
                onChange={(e) => update({ points: Number(e.target.value) })}
              />
            </div>
          )}
        />
      </div>

      <div className="field">
        <label>Fixture</label>
        <ArrayEditor<Match>
          items={payload.fixture ?? []}
          onChange={(fixture) => onChange({ ...payload, fixture })}
          emptyItem={{ homeTeam: "", awayTeam: "" }}
          addLabel="+ Agregar partido"
          renderItem={(match, update) => (
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <input
                placeholder="Local"
                value={match.homeTeam}
                onChange={(e) => update({ homeTeam: e.target.value })}
              />
              <input
                placeholder="Visitante"
                value={match.awayTeam}
                onChange={(e) => update({ awayTeam: e.target.value })}
              />
              <input placeholder="Fecha" value={match.date ?? ""} onChange={(e) => update({ date: e.target.value })} />
              <input placeholder="Cancha" value={match.venue ?? ""} onChange={(e) => update({ venue: e.target.value })} />
            </div>
          )}
        />
      </div>

      <div className="field">
        <label>Goleadores</label>
        <ArrayEditor<Scorer>
          items={payload.topScorers ?? []}
          onChange={(topScorers) => onChange({ ...payload, topScorers })}
          emptyItem={{ player: "", goals: 0 }}
          addLabel="+ Agregar goleador"
          renderItem={(scorer, update) => (
            <div className="btn-row">
              <input
                placeholder="Jugador"
                value={scorer.player}
                onChange={(e) => update({ player: e.target.value })}
              />
              <input
                type="number"
                placeholder="Goles"
                value={scorer.goals}
                onChange={(e) => update({ goals: Number(e.target.value) })}
              />
            </div>
          )}
        />
      </div>
    </>
  );
}
