import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

it('renders the login screen and honestly reports pending authentication', async () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Email ou usuário'), 'dev');
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByRole('status')).toHaveTextContent('A autenticação ainda não está conectada.');
});

it.each([
  ['Entrar com GitHub', 'O login com GitHub'],
  ['Entrar com Google', 'O login com Google'],
  ['Esqueci a senha', 'A recuperação de senha'],
])('gives feedback when selecting %s', async (name, message) => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name }));
  expect(screen.getByRole('status')).toHaveTextContent(message);
});
