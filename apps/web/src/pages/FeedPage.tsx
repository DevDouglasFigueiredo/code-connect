import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { useResource } from '../hooks/useResource';
import { getFeed, type PostDetail } from '../services/posts';
import { Feedback } from '../components/molecules/Feedback';
import { Pagination } from '../components/molecules/Pagination';
import { SearchBar } from '../components/molecules/SearchBar';
import { PostCard } from '../components/organisms/PostCard';

export function FeedPage() {
  const { hasSession, user } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').slice(0, 200);
  const sort = params.get('sort') === 'likes' ? 'likes' : 'recent';
  const candidate = Number(params.get('page'));
  const page = Number.isInteger(candidate) && candidate > 0 && candidate <= 1_000_000 ? candidate : 1;
  const load = useCallback((signal: AbortSignal) => getFeed({ q, sort, page }, signal), [q, sort, page]);
  const feed = useResource(load, `${hasSession}:${user?.id ?? ''}`);
  function filter(changes: { q?: string; sort?: string; page?: number }) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === '' || value === 1 || (key === 'sort' && value === 'recent')) next.delete(key);
      else next.set(key, String(value));
    }
    if (changes.q !== undefined || changes.sort !== undefined) next.delete('page');
    setParams(next);
  }
  function update(post: PostDetail) {
    feed.setData((current) => {
      if (!current) return current;
      const data = current.data.map((item) => item.id === post.id ? post : item);
      if (sort === 'likes') data.sort((a, b) => b.likesCount - a.likesCount || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
      return { ...current, data };
    });
    // A like may change which posts belong on a sorted page, so fetch that ordering again.
    if (sort === 'likes') feed.retry();
  }
  return <div className="space-y-12 sm:space-y-14">
    <h1 className="sr-only">Feed de posts</h1>
    <SearchBar key={q} query={q} onSearch={(value) => filter({ q: value })} />
    <section aria-label="Posts" className="space-y-8">
      <div role="group" aria-label="Ordenar posts" className="flex flex-wrap justify-center gap-6 text-xl">
        {(['recent', 'likes'] as const).map((value) => <button key={value} type="button" aria-pressed={sort === value} onClick={() => filter({ sort: value })} className={`rounded px-1 ${sort === value ? 'font-semibold text-accent underline underline-offset-4' : 'text-muted hover:text-content'}`}>{value === 'recent' ? 'Recentes' : 'Mais curtidos'}</button>)}
      </div>
      {feed.loading && <Feedback message="Carregando posts…" />}
      {feed.error && <Feedback message={feed.error} error onRetry={feed.retry} />}
      {feed.data && <>{feed.data.data.length ? <div className="grid items-stretch gap-6 lg:grid-cols-2">{feed.data.data.map((post) => <PostCard key={post.id} post={post} onUpdate={update} />)}</div> : <Feedback message={q ? 'Nenhum projeto encontrado. Tente outros termos de busca.' : 'Nenhum post por aqui ainda. Publique o primeiro projeto!'} />}
        <Pagination meta={feed.data.meta} onPage={(value) => filter({ page: value })} />
      </>}
    </section>
  </div>;
}
