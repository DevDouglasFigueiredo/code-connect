import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { mockApi, respond } from '../test/http-adapter';
import { RegistrationPage } from './RegistrationPage';

it('reports duplicate email and permits retry', async () => {
  const adapter = mockApi();
  adapter.mockImplementation(async (config) => respond(config, { message: 'Email already registered' }, 422));
  render(<MemoryRouter><RegistrationPage /></MemoryRouter>);
  await userEvent.type(screen.getByLabelText('Nome'), 'Ana Souza');
  await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Este email já está cadastrado.');
  expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
});

it.each(['GitHub', 'Google'])('reports pending %s integration', async (provider) => {
  render(<MemoryRouter><RegistrationPage /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: `Entrar com ${provider}` }));
  expect(screen.getByRole('status')).toHaveTextContent(`O login com ${provider} estará disponível em breve.`);
});
