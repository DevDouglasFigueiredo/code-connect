import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readSession, saveSession } from './auth/session';
import { mockApi, respond, user } from './test/http-adapter';
import App from './App';

beforeEach(() => { mockApi(); });
afterEach(() => vi.useRealTimers());
const open = (path = '/') => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
async function fillLogin() {
  await userEvent.type(screen.getByLabelText('Email'), user.email);
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
}
it.each(['/login', '/perfil', '/publicar'])('opens login without a session at %s', (path) => {
  open(path);
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
});
it('registers then logs in and logs out without passing the password through navigation', async () => {
  const adapter = mockApi();
  open('/cadastro');
  await userEvent.type(screen.getByLabelText('Nome'), user.name);
  await userEvent.type(screen.getByLabelText('Email'), user.email);
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toHaveValue(user.email);
  expect(screen.getByLabelText('Senha')).toHaveValue('');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(screen.getByRole('status')).toHaveTextContent('Conta criada');
  expect(adapter.mock.calls.map(([config]) => config.url)).toEqual(['/users']);
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(await screen.findByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(sessionStorage.length).toBe(1);
  expect(localStorage.length).toBe(0);
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(screen.getByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(readSession()).toBeNull();
});
it('remembers login and does not submit twice while pending', async () => {
  const adapter = mockApi();
  const original = adapter.getMockImplementation()!;
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  adapter.mockImplementation(async (config) => {
    if (config.url === '/sessions') await pending;
    return original(config);
  });
  open('/login');
  await fillLogin();
  await userEvent.dblClick(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  expect(adapter).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  expect(await screen.findByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(localStorage.length).toBe(1);
  expect(sessionStorage.length).toBe(0);
});
it.each([true, false])('restores a saved session (remember=%s) and attaches Bearer', async (remember) => {
  const adapter = mockApi();
  saveSession({ token: 'saved-token', expiresAt: Date.now() + 60000 }, remember);
  open('/login');
  expect(await screen.findByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer saved-token');
});
it('retains a session on network failure and allows retry', async () => {
  const adapter = mockApi();
  adapter.mockRejectedValueOnce(new AxiosError('offline', 'ERR_NETWORK'));
  saveSession({ token: 'saved-token', expiresAt: Date.now() + 60000 }, true);
  open('/perfil');
  expect(await screen.findByRole('alert')).toHaveTextContent('conectar à API');
  expect(readSession()?.token).toBe('saved-token');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText(user.name)).toBeInTheDocument();
});
it('clears a rejected session and returns to login', async () => {
  mockApi().mockImplementation(async (config) => respond(config, {}, 401));
  saveSession({ token: 'rejected', expiresAt: Date.now() + 60000 }, true);
  open('/perfil');
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(readSession()).toBeNull();
});
it('discards expired and malformed sessions before requesting a profile', () => {
  const adapter = mockApi();
  localStorage.setItem('code-connect.session', '{');
  sessionStorage.setItem('code-connect.session', JSON.stringify({ token: 'old', expiresAt: Date.now() - 1 }));
  open('/perfil');
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(adapter).not.toHaveBeenCalled();
  expect(localStorage.length + sessionStorage.length).toBe(0);
});
it('ends the active session when its validity expires', async () => {
  vi.useFakeTimers();
  saveSession({ token: 'short-lived', expiresAt: Date.now() + 1000 }, true);
  open('/perfil');
  await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(localStorage.length).toBe(0);
});
it('synchronizes logout from another tab', async () => {
  saveSession({ token: 'saved', expiresAt: Date.now() + 60000 }, true);
  open('/perfil');
  await screen.findByText(user.name);
  act(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent('storage')); });
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument());
});

it.each(['/', '/desconhecido'])('keeps the feed public at %s', async (path) => {
  open(path);
  expect(await screen.findByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  expect(readSession()).toBeNull();
});

it('returns to publishing after login without publishing automatically', async () => {
  const adapter = mockApi();
  open('/publicar');
  await fillLogin();
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(await screen.findByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument();
  expect(adapter.mock.calls.some(([config]) => config.url === '/posts' && config.method === 'post')).toBe(false);
});

it('returns from an anonymous like to the feed without replaying the action', async () => {
  const adapter = mockApi();
  open('/?q=React');
  await userEvent.click(await screen.findByRole('button', { name: 'Curtir post' }));
  await fillLogin();
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(await screen.findByRole('heading', { name: 'Feed de posts' })).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toHaveValue('React');
  expect(adapter.mock.calls.some(([config]) => config.method === 'put')).toBe(false);
});
