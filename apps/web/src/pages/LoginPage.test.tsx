import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import { mockApi, respond } from '../test/http-adapter';
import { LoginPage } from './LoginPage';

beforeEach(() => { mockApi(); });
function renderPage(state?: object) {
  render(<MemoryRouter initialEntries={[{ pathname: '/login', state }]}><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
}

it('shows registration feedback and prefills email and remember preference', () => {
  renderPage({ registered: true, email: 'ana@example.com', rememberMe: false });
  expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(screen.getByRole('status')).toHaveTextContent('Conta criada com sucesso');
});

it('reports invalid credentials accessibly', async () => {
  const adapter = mockApi();
  adapter.mockImplementation(async (config) => respond(config, { message: 'Invalid email or password' }, 401));
  renderPage();
  await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha inválidos');
  expect(localStorage.length).toBe(0);
});

it.each([
  ['Entrar com GitHub', 'O login com GitHub'],
  ['Entrar com Google', 'O login com Google'],
  ['Esqueci a senha', 'A recuperação de senha'],
])('gives feedback when selecting %s', async (name, message) => {
  renderPage();
  await userEvent.click(screen.getByRole('button', { name }));
  expect(screen.getByRole('status')).toHaveTextContent(message);
});
