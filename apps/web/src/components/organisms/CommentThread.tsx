import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context';
import { useResource } from '../../hooks/useResource';
import { createComment, getComments, type Comment } from '../../services/posts';
import { AuthorBadge } from '../molecules/AuthorBadge';
import { CommentForm } from '../molecules/CommentForm';
import { Feedback } from '../molecules/Feedback';
import { Pagination } from '../molecules/Pagination';

export function CommentThread({ comment, onCreated }: { comment: Comment; onCreated: () => void }) {
  const { hasSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(comment.repliesCount);
  const load = useCallback((signal: AbortSignal) => expanded ? getComments(comment.postId, page, comment.id, signal) : Promise.resolve(null), [expanded, comment.postId, comment.id, page]);
  const replies = useResource(load);
  function reply() {
    if (!hasSession) { navigate('/login', { state: { from: location.pathname + '#comentarios' } }); return; }
    setReplying((value) => !value);
  }
  async function submit(text: string) {
    await createComment(comment.postId, text, comment.id);
    setReplying(false); setCount((value) => value + 1); setExpanded(true);
    setPage(Math.ceil((count + 1) / 10)); replies.retry(); onCreated();
  }
  return <li className="space-y-3 border-b border-surface/30 py-5 last:border-0">
    <AuthorBadge name={comment.author.name} /><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{comment.text}</p>
    <div className="flex flex-wrap gap-4 text-sm"><button type="button" onClick={reply} className="rounded font-semibold underline">Responder</button>
      {count > 0 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="rounded underline">{expanded ? 'Ocultar respostas' : `Ver respostas (${count})`}</button>}
    </div>
    {replying && hasSession && <CommentForm label={`Responder a ${comment.author.name}`} onSubmit={submit} onCancel={() => setReplying(false)} />}
    {expanded && <div className="space-y-4 border-l border-surface/30 pl-4 sm:pl-10">
      {replies.loading && <Feedback message="Carregando respostas…" />}
      {replies.error && <Feedback message={replies.error} error onRetry={replies.retry} />}
      {replies.data && <><ul aria-label={`Respostas a ${comment.author.name}`} className="space-y-5">{replies.data.data.map((item) => <li key={item.id} className="space-y-2"><AuthorBadge name={item.author.name} /><p className="whitespace-pre-wrap break-words text-sm">{item.text}</p></li>)}</ul>
        <Pagination meta={replies.data.meta} onPage={setPage} label="Paginação de respostas" /></>}
    </div>}
  </li>;
}
