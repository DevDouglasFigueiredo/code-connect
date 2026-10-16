import { useState, type FormEvent } from 'react';
import { Icon } from '../atoms/Icon';
import { Tag } from '../atoms/Tag';

export function SearchBar({ query, onSearch }: { query: string; onSearch: (query: string) => void }) {
  const [draft, setDraft] = useState(query);
  function apply(value: string) { setDraft(value); onSearch(value.trim()); }
  function submit(event: FormEvent) { event.preventDefault(); apply(draft); }
  const terms = query.split(/\s+/).filter(Boolean);
  return <section aria-label="Busca de posts" className="space-y-4">
    <form role="search" onSubmit={submit} className="flex items-center gap-4 rounded bg-surface px-4 py-2 text-secondary">
      <button type="submit" aria-label="Buscar posts" className="shrink-0 rounded p-1"><Icon name="search" className="size-6 sm:size-8" /></button>
      <input aria-label="Digite o que você procura" type="search" value={draft} maxLength={200} onChange={(event) => setDraft(event.target.value)} placeholder="Digite o que você procura" className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-offset-4 placeholder:text-secondary sm:text-xl" />
    </form>
    {terms.length > 0 && <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2 sm:gap-4">{terms.map((term, index) => <Tag key={`${term}-${index}`} onRemove={() => apply(terms.filter((_, i) => i !== index).join(' '))}>{term}</Tag>)}</div>
      <button type="button" onClick={() => apply('')} className="text-sm text-muted hover:text-content sm:text-base">Limpar tudo</button>
    </div>}
  </section>;
}
