export function Avatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] ?? '').join('').toLocaleUpperCase('pt-BR');
  return <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-content text-xs font-semibold text-surface">{initials || '?'}</span>;
}
