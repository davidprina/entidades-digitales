import type { SportsTeamPayload } from "../../types";
import { ArrayEditor } from "../ArrayEditor";

type Player = NonNullable<SportsTeamPayload["players"]>[number];

export function SportsTeamForm({
  payload,
  onChange,
}: {
  payload: Partial<SportsTeamPayload>;
  onChange: (payload: Partial<SportsTeamPayload>) => void;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor="crestUrl">Escudo (URL de imagen)</label>
        <input
          id="crestUrl"
          value={payload.crestUrl ?? ""}
          onChange={(e) => onChange({ ...payload, crestUrl: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Próximo partido</label>
        <input
          placeholder="Rival"
          value={payload.nextMatch?.opponent ?? ""}
          onChange={(e) =>
            onChange({ ...payload, nextMatch: { ...payload.nextMatch, opponent: e.target.value } })
          }
          style={{ marginBottom: 8 }}
        />
        <input
          placeholder="Fecha (ej: 2026-08-01)"
          value={payload.nextMatch?.date ?? ""}
          onChange={(e) => onChange({ ...payload, nextMatch: { ...payload.nextMatch, date: e.target.value } })}
          style={{ marginBottom: 8 }}
        />
        <input
          placeholder="Cancha"
          value={payload.nextMatch?.venue ?? ""}
          onChange={(e) => onChange({ ...payload, nextMatch: { ...payload.nextMatch, venue: e.target.value } })}
        />
      </div>

      <div className="field">
        <label>Plantel</label>
        <ArrayEditor<Player>
          items={payload.players ?? []}
          onChange={(players) => onChange({ ...payload, players })}
          emptyItem={{ name: "" }}
          addLabel="+ Agregar jugador"
          renderItem={(player, update) => (
            <div className="btn-row" style={{ alignItems: "flex-end" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>#</label>
                <input
                  type="number"
                  value={player.number ?? ""}
                  onChange={(e) => update({ number: Number(e.target.value) })}
                />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>Nombre</label>
                <input value={player.name} onChange={(e) => update({ name: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>Posición</label>
                <input value={player.position ?? ""} onChange={(e) => update({ position: e.target.value })} />
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
}
