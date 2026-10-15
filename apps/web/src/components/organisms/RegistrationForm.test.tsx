import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { RegistrationForm } from './RegistrationForm';

it('submits trimmed name and email and the selected remember preference', async () => {
  const onSubmit = vi.fn();
  render(<RegistrationForm onSubmit={onSubmit} />);
  expect(screen.getByLabelText('Nome')).toHaveValue('');
  expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'new-password');
  expect(screen.getByRole('checkbox')).toBeChecked();
  await userEvent.type(screen.getByLabelText('Nome'), '  Ana Souza  ');
  await userEvent.type(screen.getByLabelText('Email'), ' ana@example.com ');
  await userEvent.type(screen.getByLabelText('Senha'), ' segredo ');
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana Souza', email: 'ana@example.com', password: ' segredo ', rememberMe: false });
});

it.each([
  ['', 'ana@example.com', 'segredo'],
  ['   ', 'ana@example.com', 'segredo'],
  ['Ana', '', 'segredo'],
  ['Ana', 'invalido', 'segredo'],
  ['Ana', 'ana@example.com', ''],
])('blocks invalid registration (%s, %s)', async (name, email, password) => {
  const onSubmit = vi.fn();
  render(<RegistrationForm onSubmit={onSubmit} />);
  if (name) await userEvent.type(screen.getByLabelText('Nome'), name);
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  if (password) await userEvent.type(screen.getByLabelText('Senha'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(onSubmit).not.toHaveBeenCalled();
});

it('enforces password limits and disables pending submissions', () => {
  render(<RegistrationForm onSubmit={vi.fn()} isSubmitting />);
  expect(screen.getByLabelText('Senha')).toHaveAttribute('minlength', '8');
  expect(screen.getByLabelText('Senha')).toHaveAttribute('maxlength', '128');
  expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled();
});
