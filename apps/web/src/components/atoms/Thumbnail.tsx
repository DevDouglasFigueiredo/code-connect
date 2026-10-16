import { useState } from 'react';
import { Icon } from './Icon';

export function Thumbnail({ src, title, large = false }: { src: string | null; title: string; large?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // Only load HTTP(S) images; never render executable/data URLs supplied by content.
  const valid = !!src && /^https?:\/\//i.test(src) && failedSrc !== src;
  return <div className={`bg-field p-6 ${large ? 'rounded-t-lg px-4' : 'rounded-t-lg'}`}>
    <div className={`overflow-hidden rounded-lg shadow-editor ${large ? 'h-80' : 'h-48'}`}>
      {valid ? <img src={src} alt={`Prévia de ${title}`} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} /> :
        <div role="img" aria-label={`Sem imagem para ${title}`} className="flex h-full flex-col items-center justify-center gap-3 bg-button-content px-4 text-center text-accent">
          <Icon name="image" className="size-12" /><span className="text-sm">Projeto sem imagem</span>
        </div>}
    </div>
  </div>;
}
