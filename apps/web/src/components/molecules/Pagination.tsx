import type { PageMeta } from '../../services/posts';

export function Pagination({ meta, onPage, label = 'Paginação' }: { meta: PageMeta; onPage: (page: number) => void; label?: string }) {
  if (meta.totalPages < 2 && meta.page === 1) return null;
  const style = 'rounded border border-muted px-3 py-2 text-sm disabled:opacity-40';
  return <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-3">
    <button type="button" className={style} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Anterior</button>
    <span className="text-sm">Página {meta.page} de {Math.max(meta.totalPages, 1)}</span>
    <button type="button" className={style} disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>Próxima</button>
  </nav>;
}
