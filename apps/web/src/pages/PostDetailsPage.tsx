import { useCallback, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { useResource } from '../hooks/useResource';
import { getPost } from '../services/posts';
import { Feedback } from '../components/molecules/Feedback';
import { PostCard } from '../components/organisms/PostCard';
import { CommentsSection } from '../components/organisms/CommentsSection';

export function PostDetailsPage() {
  const { id = '' } = useParams();
  const { hasSession, user } = useAuth();
  const { hash } = useLocation();
  const load = useCallback((signal: AbortSignal) => getPost(id, signal), [id]);
  const post = useResource(load, `${hasSession}:${user?.id ?? ''}`);
  useEffect(() => {
    if (post.data && hash === '#comentarios') document.getElementById('comentarios')?.scrollIntoView?.({ block: 'start' });
  }, [hash, post.data]);
  async function refreshCounts() {
    try {
      const updated = await getPost(id);
      post.setData((current) => current?.id === id ? { ...current, commentsCount: updated.commentsCount } : current);
    }
    catch { /* The comment is already saved; keep the readable post if a count refresh fails. */ }
  }
  return <div className="space-y-8 sm:space-y-10">
    <Link to="/" className="inline-flex rounded text-sm text-accent hover:underline">← Voltar ao feed</Link>
    {post.loading && <Feedback message="Carregando projeto…" />}
    {post.error && <Feedback message={post.error} error onRetry={post.retry} />}
    {post.data && <><PostCard post={post.data} detail onUpdate={(value) => post.setData(value)} />
      {post.data.code && <section aria-labelledby="code-title" className="space-y-2"><h2 id="code-title" className="text-xl font-semibold text-muted">Código:</h2>
        <pre className="max-h-96 overflow-auto rounded-lg bg-surface p-4 text-sm text-secondary shadow-editor" tabIndex={0}><code>{post.data.code}</code></pre>
      </section>}
      <CommentsSection key={id} postId={id} onCreated={() => void refreshCounts()} />
    </>}
  </div>;
}
