import type { Collection, Comment, PostDetail } from '../services/posts';

export const post: PostDetail = {
  id: 'post-1', author: { id: 'author-1', name: 'Julio Oliveira' }, title: 'Componentes acessíveis com React',
  description: 'Um projeto sobre composição e acessibilidade.', code: 'const hello = "<script>exemplo</script>";',
  thumbnailUrl: 'https://example.com/preview.png', tags: ['React', 'Acessibilidade'], createdAt: '2026-10-01T12:00:00.000Z',
  likesCount: 2, commentsCount: 1, likedByMe: false,
};
export const comment: Comment = { id: 'comment-1', postId: post.id, parentId: null, author: { id: 'reader', name: 'Marcia Santos' },
  text: 'Gostei do projeto!', createdAt: post.createdAt, repliesCount: 1 };
export const collection = <T,>(data: T[], page = 1, total = data.length, limit = 6): Collection<T> => ({ data, links: { self: '/posts' }, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
