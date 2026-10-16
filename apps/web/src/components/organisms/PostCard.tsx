import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context';
import { postError, setPostLike, type Post, type PostDetail } from '../../services/posts';
import { Thumbnail } from '../atoms/Thumbnail';
import { Tag } from '../atoms/Tag';
import { AuthorBadge } from '../molecules/AuthorBadge';
import { PostActions } from '../molecules/PostActions';
import { Feedback } from '../molecules/Feedback';

export function PostCard({ post, detail = false, onUpdate }: { post: Post; detail?: boolean; onUpdate: (post: PostDetail) => void }) {
  const { hasSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const submitting = useRef(false);
  async function like() {
    if (!hasSession) { navigate('/login', { state: { from: location.pathname + location.search + location.hash } }); return; }
    if (submitting.current) return;
    submitting.current = true;
    setPending(true); setMessage('');
    try { onUpdate(await setPostLike(post.id, !post.likedByMe)); }
    catch (reason: unknown) { setMessage(postError(reason)); setError(true); }
    finally { submitting.current = false; setPending(false); }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(new URL(`/posts/${post.id}`, window.location.origin).href);
      setMessage('Link copiado!'); setError(false);
    } catch { setMessage('Não foi possível copiar o link. Copie o endereço da página de detalhes.'); setError(true); }
  }
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-lg bg-surface">
    {detail ? <Thumbnail src={post.thumbnailUrl} title={post.title} large /> : <Link to={`/posts/${post.id}`} tabIndex={-1} aria-hidden="true"><Thumbnail src={post.thumbnailUrl} title={post.title} /></Link>}
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-2 text-secondary">
        {detail ? <h1 className="break-words text-xl font-semibold sm:text-2xl">{post.title}</h1> : <h2 className="break-words text-lg font-semibold"><Link to={`/posts/${post.id}`} className="hover:text-accent hover:underline">{post.title}</Link></h2>}
        <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${detail ? '' : 'line-clamp-4'}`}>{post.description}</p>
      </div>
      {post.tags.length > 0 && <div className="flex flex-wrap gap-2">{post.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 text-muted">
        <PostActions id={post.id} liked={hasSession && post.likedByMe} likes={post.likesCount} comments={post.commentsCount} pending={pending} onLike={() => void like()} onShare={() => void share()} />
        <div className="max-w-full sm:max-w-[55%]"><AuthorBadge name={post.author.name} /></div>
      </div>
      {message && <Feedback message={message} error={error} />}
    </div>
  </article>;
}
