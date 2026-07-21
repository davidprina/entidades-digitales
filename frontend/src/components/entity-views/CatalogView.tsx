import type { CatalogPayload } from "../../types";

const currencyFormatter = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function CatalogView({ title, payload }: { title: string; payload: CatalogPayload }) {
  return (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        <h1>{title}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {payload.products?.map((product, i) => (
          <div className="card" key={i} style={{ textAlign: "left" }}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: "100%", borderRadius: 8, marginBottom: 8, aspectRatio: "1/1", objectFit: "cover" }}
              />
            )}
            <h3 style={{ margin: "0 0 4px" }}>{product.name}</h3>
            {product.description && (
              <p style={{ fontSize: "0.8rem", margin: "0 0 6px" }}>{product.description}</p>
            )}
            <strong>{currencyFormatter.format(product.price)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
