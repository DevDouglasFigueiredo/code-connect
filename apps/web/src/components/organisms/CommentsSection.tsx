import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context';
import { useResource } from '../../hooks/useResource';
import { createComment, getComments } from '../../services/posts';
import { CommentForm } from '../molecules/CommentForm';
import { Feedback } from '../molecules/Feedback';
import { Pagination } from '../molecules/Pagination';
import { CommentThread } from './CommentThread';

export function CommentsSection({ postId, onCreated }: { postId: string; onCreated: () => void }) {
  const { hasSession } = useAuth();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const load = useCallback((signal: AbortSignal) => getComments(postId, page, undefined, signal), [postId, page]);
  const comments = useResource(load);
  async function submit(text: string) {
    await createComment(postId, text);
    const lastPage = Math.ceil(((comments.data?.meta.total ?? 0) + 1) / 10);
    setPage(lastPage); comments.retry(); onCreated();
  }
  return <section id="comentarios" aria-labelledby="comments-title" className="scroll-mt-6 space-y-6 rounded-lg bg-field p-4 text-surface sm:p-8">
    <h2 id="comments-title" className="text-xl font-semibold">Comentários</h2>
    {hasSession ? <CommentForm onSubmit={submit} /> : <p className="text-sm"><Link to="/login" state={{ from: location.pathname + '#comentarios' }} className="font-semibold underline">Faça login</Link> para comentar e responder.</p>}
    {comments.loading && <Feedback message="Carregando comentários…" />}
    {comments.error && <Feedback message={comments.error} error onRetry={comments.retry} />}
    {comments.data && <>{comments.data.data.length ? <ul aria-label="Comentários do post">{comments.data.data.map((comment) => <CommentThread key={comment.id} comment={comment} onCreated={onCreated} />)}</ul> : <p className="text-sm">Nenhum comentário ainda. Comece a conversa!</p>}
      <Pagination meta={comments.data.meta} onPage={setPage} label="Paginação de comentários" /></>}
  </section>;
}
