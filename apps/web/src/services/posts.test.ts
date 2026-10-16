import { AxiosError } from 'axios';
import { expect, it } from 'vitest';
import { mockApi, respond } from '../test/http-adapter';
import { createComment, createPost, getComments, getFeed, getPost, postError, setPostLike } from './posts';

it('sends feed filters and pagination to the backend', async () => {
  const adapter = mockApi(); const controller = new AbortController();
  await getFeed({ q: 'React', sort: 'likes', page: 2 }, controller.signal);
  expect(adapter.mock.calls[0][0]).toMatchObject({ url: '/posts', params: { q: 'React', sort: 'likes', page: 2, limit: 6 }, signal: controller.signal });
});
it('sends post and comment payloads and retrieves paginated replies', async () => {
  const adapter = mockApi();
  const input = { title: 'Title', description: 'Description', code: null, thumbnailUrl: null, tags: ['React'] };
  await createPost(input); await createComment('post', ' Hello ', 'root'); await getComments('post', 3, 'root');
  expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual(input);
  expect(JSON.parse(adapter.mock.calls[1][0].data)).toEqual({ text: 'Hello', parentId: 'root' });
  expect(adapter.mock.calls[2][0].params).toEqual({ page: 3, limit: 10, parentId: 'root' });
});
it('removes a like and refreshes server counts', async () => {
  const adapter = mockApi(); await setPostLike('post', false);
  expect(adapter.mock.calls.map(([config]) => [config.method, config.url])).toEqual([['delete', '/posts/post/likes/me'], ['get', '/posts/post']]);
});
it.each([[401, 'sessão expirou'], [404, 'não foi encontrado'], [422, 'limites']])('translates post HTTP errors %s', async (status, expected) => {
  mockApi().mockImplementation(async (config) => respond(config, {}, status));
  await getPost('post').catch((error: unknown) => expect(postError(error)).toContain(expected));
});
it('reports network errors without registration-specific advice', () => {
  expect(postError(new AxiosError('offline', 'ERR_NETWORK'))).toContain('conectar à API');
});
