import { Icon } from './Icon';

export function Tag({ children, onRemove }: { children: string; onRemove?: () => void }) {
  const styles = 'inline-flex max-w-full items-center gap-2 rounded bg-secondary px-2 py-1 text-sm text-surface';
  return onRemove ? <button type="button" onClick={onRemove} aria-label={`Remover ${children}`} className={`${styles} hover:bg-field`}><span className="break-all">{children}</span><Icon name="close" className="size-4 shrink-0" /></button> :
    <span className={styles}><span className="break-all">{children}</span></span>;
}
