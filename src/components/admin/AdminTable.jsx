import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export default function AdminTable({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  emptyMessage = 'No hay registros.',
  paginated = true,
  defaultPageSize = 10,
  pageSizes = DEFAULT_PAGE_SIZES,
  searchable = true,
  searchPlaceholder = 'Buscar...',
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filtered data (client-side search across all stringifiable column values)
  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return data || [];
    const q = search.trim().toLowerCase();
    return (data || []).filter((row) =>
      columns.some((col) => {
        const val = col.render ? null : row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns, searchable]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = paginated ? filtered.slice(startIdx, startIdx + pageSize) : filtered;

  // Reset page when search or pageSize changes
  useEffect(() => { setPage(1); }, [search, pageSize]);

  if (loading) {
    return (
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b animate-pulse" style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }} />
        ))}
      </div>
    );
  }

  const showToolbar = searchable || paginated;
  const showFooter = paginated && filtered.length > 0;

  return (
    <div className="space-y-3">
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {searchable ? (
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border outline-none transition"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          ) : <div />}
          {paginated && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg border text-xs"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>de {filtered.length.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {!filtered.length ? (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          {search.trim() ? `No hay resultados para "${search}"` : emptyMessage}
        </div>
      ) : (
        <>
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
                {pageRows.map((row, idx) => (
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

          {showFooter && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} de {filtered.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <PageButton onClick={() => setPage(1)} disabled={safePage === 1} title="Primera página"><ChevronsLeft size={14} /></PageButton>
                <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} title="Anterior"><ChevronLeft size={14} /></PageButton>
                <span className="px-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Página {safePage} de {totalPages}
                </span>
                <PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} title="Siguiente"><ChevronRight size={14} /></PageButton>
                <PageButton onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="Última página"><ChevronsRight size={14} /></PageButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PageButton({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
    >
      {children}
    </button>
  );
}
