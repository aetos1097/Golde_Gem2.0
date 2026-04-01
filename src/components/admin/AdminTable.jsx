import { Pencil, Trash2, Eye } from 'lucide-react';

export default function AdminTable({ columns, data, loading, onEdit, onDelete, onView, emptyMessage = 'No hay registros.' }) {
  if (loading) {
    return (
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b animate-pulse" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-secondary)' }}>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {col.label}
              </th>
            ))}
            {(onView || onEdit || onDelete) && (
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="border-t hover:brightness-95 transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <button onClick={() => onView(row)} className="p-2 rounded-lg hover:bg-black/5 transition" style={{ color: 'var(--text-secondary)' }} title="Ver detalle">
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="p-2 rounded-lg hover:bg-black/5 transition" style={{ color: 'var(--accent)' }} title="Editar">
                        <Pencil size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="p-2 rounded-lg hover:bg-red-500/10 transition text-red-500" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
