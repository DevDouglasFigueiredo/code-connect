import { Icon } from '../atoms/Icon';

export function SocialLogin({ onSelect }: { onSelect: (provider: 'github' | 'google') => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs"><span className="h-px flex-1 bg-muted" /><span>ou entre com outras contas</span><span className="h-px flex-1 bg-muted" /></div>
      <div className="flex justify-center gap-5">
        <button type="button" onClick={() => onSelect('github')} aria-label="Entrar com GitHub" className="flex flex-col items-center gap-1 text-xs transition hover:text-accent"><Icon name="github" className="size-7" />Github</button>
        <button type="button" onClick={() => onSelect('google')} aria-label="Entrar com Google" className="flex flex-col items-center gap-1 text-xs transition hover:text-accent"><Icon name="google" className="size-7" />Gmail</button>
      </div>
    </div>
  );
}
