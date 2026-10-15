import { AxiosError } from 'axios';
import { expect, it } from 'vitest';
import { getProfile, register, signIn } from './auth';
import { errorMessage } from './http';
import { saveSession } from '../auth/session';
import { mockApi, respond } from '../test/http-adapter';

it('sends exact API payloads, normalizes identity and preserves passwords', async () => {
  const adapter = mockApi();
  const input = { name: ' Ana ', email: ' ANA@example.com ', password: ' password ', rememberMe: true };
  await register(input);
  expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ name: 'Ana', email: 'ana@example.com', password: ' password ' });
  await signIn(input);
  expect(JSON.parse(adapter.mock.calls[1][0].data)).toEqual({ email: 'ana@example.com', password: ' password ' });
});
it('attaches Bearer to profile requests and clears rejected sessions', async () => {
  const adapter = mockApi();
  saveSession({ token: 'token', expiresAt: Date.now() + 10000 }, true);
  await getProfile();
  expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer token');
  adapter.mockImplementation(async (config) => respond(config, {}, 401));
  await expect(getProfile()).rejects.toThrow();
  expect(localStorage.length).toBe(0);
});
it.each([
  ['ECONNABORTED', 'demorou demais'], ['ETIMEDOUT', 'demorou demais'], ['ERR_NETWORK', 'conectar à API'],
])('translates %s errors', (code, message) => {
  expect(errorMessage(new AxiosError('error', code))).toContain(message);
});
it.each([[422, 'Confira os dados'], [500, 'indisponível']])('translates HTTP %s', async (status, message) => {
  const adapter = mockApi();
  adapter.mockImplementation(async (config) => respond(config, {}, status));
  await getProfile().catch((error: unknown) => expect(errorMessage(error)).toContain(message));
});

it('does not send a stored token to public registration or login', async () => {
  const adapter = mockApi();
  saveSession({ token: 'private-token', expiresAt: Date.now() + 10000 }, true);
  await register({ name: 'Ana', email: 'ana@example.com', password: 'password123' });
  await signIn({ email: 'ana@example.com', password: 'password123' });
  for (const [config] of adapter.mock.calls) expect(config.headers.get('Authorization')).toBeUndefined();
});

it('does not discard a replacement session when an old request receives 401', async () => {
  const adapter = mockApi();
  saveSession({ token: 'old', expiresAt: Date.now() + 10000 }, true);
  adapter.mockImplementation(async (config) => {
    saveSession({ token: 'new', expiresAt: Date.now() + 10000 }, true);
    return respond(config, {}, 401);
  });
  await expect(getProfile()).rejects.toThrow();
  expect(JSON.parse(localStorage.getItem('code-connect.session')!).token).toBe('new');
});
