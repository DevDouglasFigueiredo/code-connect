import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

it('submits credentials and the selected remember preference', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} onForgotPassword={vi.fn()} />);
  await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
  expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }));
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'segredo123', rememberMe: false });
});

it('blocks empty credentials and delegates password recovery', async () => {
  const onSubmit = vi.fn();
  const onForgotPassword = vi.fn();
  render(<LoginForm onSubmit={onSubmit} onForgotPassword={onForgotPassword} />);
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(onSubmit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Esqueci a senha' }));
  expect(onForgotPassword).toHaveBeenCalledOnce();
});

it('disables submission while a login is pending', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} onForgotPassword={vi.fn()} isSubmitting />);
  expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Entrando…' }));
  expect(onSubmit).not.toHaveBeenCalled();
});
