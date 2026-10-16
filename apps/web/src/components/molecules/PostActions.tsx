import { Link } from 'react-router-dom';
import { Icon } from '../atoms/Icon';

export function PostActions({ id, liked, likes, comments, pending, onLike, onShare }: {
  id: string; liked: boolean; likes: number; comments: number; pending: boolean; onLike: () => void; onShare: () => void;
}) {
  const style = 'flex min-h-11 min-w-8 flex-col items-center justify-center gap-1 rounded text-xs hover:text-accent';
  return <div className="flex items-start gap-3 text-muted">
    <button type="button" aria-label={liked ? 'Remover curtida' : 'Curtir post'} aria-pressed={liked} disabled={pending} onClick={onLike} className={`${style} disabled:opacity-50 ${liked ? 'text-accent' : ''}`}><Icon name="like" className="size-6" /><span>{likes}</span></button>
    <button type="button" aria-label="Compartilhar post" onClick={onShare} className={style}><Icon name="share" className="size-5" /><span className="sr-only">Copiar link</span></button>
    <Link to={`/posts/${id}#comentarios`} aria-label={`Ver comentários (${comments})`} className={style}><Icon name="comment" className="size-5" /><span>{comments}</span></Link>
  </div>;
}
