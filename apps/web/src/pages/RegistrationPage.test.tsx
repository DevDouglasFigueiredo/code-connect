import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { RegistrationPage } from './RegistrationPage';

it('renders registration and reports pending integration after valid submission', async () => {
  render(<MemoryRouter><RegistrationPage /></MemoryRouter>);
  expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login');
  await userEvent.type(screen.getByLabelText('Nome'), 'Ana Souza');
  await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo');
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(screen.getByRole('status')).toHaveTextContent('O cadastro ainda não está conectado.');
});

it.each(['GitHub', 'Google'])('reports pending %s integration', async (provider) => {
  render(<MemoryRouter><RegistrationPage /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: `Entrar com ${provider}` }));
  expect(screen.getByRole('status')).toHaveTextContent(`O login com ${provider} estará disponível em breve.`);
});
