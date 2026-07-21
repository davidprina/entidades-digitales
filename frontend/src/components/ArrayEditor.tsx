import type { ReactNode } from "react";

interface ArrayEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  emptyItem: T;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
}

export function ArrayEditor<T>({ items, onChange, emptyItem, renderItem, addLabel }: ArrayEditorProps<T>) {
  function updateAt(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="card" style={{ background: "var(--bg)" }}>
          {renderItem(item, (patch) => updateAt(i, patch))}
          <button type="button" className="btn btn-danger" onClick={() => removeAt(i)}>
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => onChange([...items, emptyItem])}>
        {addLabel}
      </button>
    </div>
  );
}
