import type { CatalogPayload } from "../../types";
import { ArrayEditor } from "../ArrayEditor";

type Product = CatalogPayload["products"][number];

export function CatalogForm({
  payload,
  onChange,
}: {
  payload: Partial<CatalogPayload>;
  onChange: (payload: Partial<CatalogPayload>) => void;
}) {
  return (
    <div className="field">
      <label>Productos</label>
      <ArrayEditor<Product>
        items={payload.products ?? []}
        onChange={(products) => onChange({ ...payload, products })}
        emptyItem={{ name: "", price: 0 }}
        addLabel="+ Agregar producto"
        renderItem={(product, update) => (
          <>
            <div className="field">
              <label>Nombre</label>
              <input value={product.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div className="field">
              <label>Precio</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => update({ price: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Imagen (URL)</label>
              <input value={product.imageUrl ?? ""} onChange={(e) => update({ imageUrl: e.target.value })} />
            </div>
            <div className="field">
              <label>Descripción</label>
              <input
                value={product.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
          </>
        )}
      />
    </div>
  );
}
