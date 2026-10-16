import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { vi } from 'vitest';
import { collection, post, comment } from './posts';
import { http } from '../services/http';

export const user = { id: 'user-id', name: 'Ana Silva', email: 'ana@example.com' };
export function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  const response = { data, status, statusText: String(status), headers: new AxiosHeaders(), config };
  if (status >= 400) throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, response);
  return response;
}
export function mockApi() {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    if (config.url === '/posts' && config.method === 'get') return respond(config, collection([post]));
    if (config.url === '/posts' && config.method === 'post') return respond(config, { data: post });
    if (config.url?.endsWith('/comments')) return respond(config, collection(config.params?.parentId ? [] : [comment]));
    if (config.url?.startsWith('/posts/')) return respond(config, { data: post });
    if (config.url === '/sessions') return respond(config, { data: { access_token: 'valid-token', token_type: 'Bearer', expires_in: 3600 }, links: {} });
    return respond(config, { data: user, links: {} });
  });
  http.defaults.adapter = adapter;
  return adapter;
}
