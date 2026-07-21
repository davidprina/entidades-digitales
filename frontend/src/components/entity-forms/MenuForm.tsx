import type { MenuPayload } from "../../types";
import { ArrayEditor } from "../ArrayEditor";

type Category = MenuPayload["categories"][number];
type Item = Category["items"][number];

export function MenuForm({
  payload,
  onChange,
}: {
  payload: Partial<MenuPayload>;
  onChange: (payload: Partial<MenuPayload>) => void;
}) {
  const categories = payload.categories ?? [];

  return (
    <div className="field">
      <label>Categorías del menú</label>
      <ArrayEditor<Category>
        items={categories}
        onChange={(next) => onChange({ ...payload, categories: next })}
        emptyItem={{ name: "", items: [] }}
        addLabel="+ Agregar categoría"
        renderItem={(category, update) => (
          <>
            <div className="field">
              <label>Nombre de la categoría</label>
              <input value={category.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <ArrayEditor<Item>
              items={category.items}
              onChange={(items) => update({ items })}
              emptyItem={{ name: "", price: 0 }}
              addLabel="+ Agregar plato"
              renderItem={(item, updateItem) => (
                <div className="btn-row" style={{ alignItems: "flex-end" }}>
                  <div className="field" style={{ flex: 2 }}>
                    <label>Plato</label>
                    <input value={item.name} onChange={(e) => updateItem({ name: e.target.value })} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem({ price: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            />
          </>
        )}
      />
    </div>
  );
}
