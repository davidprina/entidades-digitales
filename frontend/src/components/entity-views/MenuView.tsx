import type { MenuPayload } from "../../types";

const currencyFormatter = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function MenuView({ title, payload }: { title: string; payload: MenuPayload }) {
  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        <h1>{title}</h1>
      </div>

      {payload.categories?.map((category, i) => (
        <div className="card" key={i}>
          <h2>{category.name}</h2>
          {category.items.map((item, j) => (
            <div className="list-item" key={j}>
              <div>
                <div>{item.name}</div>
                {item.description && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text)" }}>{item.description}</div>
                )}
              </div>
              <strong>{currencyFormatter.format(item.price)}</strong>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
