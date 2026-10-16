import axios from 'axios';
import { http, errorMessage } from './http';

export type Author = { id: string; name: string };
export type Post = {
  id: string; author: Author; title: string; description: string; thumbnailUrl: string | null;
  tags: string[]; createdAt: string; likesCount: number; commentsCount: number; likedByMe: boolean;
};
export type PostDetail = Post & { code: string | null };
export type Comment = { id: string; postId: string; author: Author; text: string; parentId: string | null; createdAt: string; repliesCount: number };
export type PageMeta = { page: number; limit: number; total: number; totalPages: number };
export type Collection<T> = { data: T[]; meta: PageMeta; links: { self: string; next?: string; previous?: string } };
export type PostInput = { title: string; description: string; tags: string[]; code: string | null; thumbnailUrl: string | null };
export type FeedQuery = { q: string; sort: 'recent' | 'likes'; page: number };

export async function getFeed(query: FeedQuery, signal?: AbortSignal): Promise<Collection<Post>> {
  return (await http.get<Collection<Post>>('/posts', { params: { ...query, limit: 6 }, signal })).data;
}
export async function getPost(id: string, signal?: AbortSignal): Promise<PostDetail> {
  return (await http.get<{ data: PostDetail }>(`/posts/${encodeURIComponent(id)}`, { signal })).data.data;
}
export async function createPost(input: PostInput): Promise<PostDetail> {
  return (await http.post<{ data: PostDetail }>('/posts', input)).data.data;
}
export async function setPostLike(id: string, liked: boolean): Promise<PostDetail> {
  const url = `/posts/${encodeURIComponent(id)}/likes/me`;
  if (liked) await http.put(url);
  else await http.delete(url);
  return getPost(id);
}
export async function getComments(postId: string, page: number, parentId?: string, signal?: AbortSignal): Promise<Collection<Comment>> {
  return (await http.get<Collection<Comment>>(`/posts/${encodeURIComponent(postId)}/comments`, { params: { page, limit: 10, ...(parentId ? { parentId } : {}) }, signal })).data;
}
export async function createComment(postId: string, text: string, parentId?: string): Promise<Comment> {
  return (await http.post<{ data: Comment }>(`/posts/${encodeURIComponent(postId)}/comments`, { text: text.trim(), ...(parentId ? { parentId } : {}) })).data.data;
}
export function postError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return 'Este conteúdo não foi encontrado.';
    if (error.response?.status === 422) return 'Confira os campos e os limites informados e tente novamente.';
    if (error.response?.status === 401) return 'Sua sessão expirou. Faça login para continuar.';
  }
  return errorMessage(error);
}
