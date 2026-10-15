import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { mockApi, user } from '../test/http-adapter';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './auth-context';

function Consumer() {
  const { user, login, logout } = useAuth();
  return <><p>{user?.name ?? 'Visitante'}</p><button onClick={() => void login({ email: 'ana@example.com', password: 'password123' }, true)}>Entrar</button><button onClick={logout}>Sair</button></>;
}
it('provides the authenticated user and clears it on logout', async () => {
  mockApi();
  render(<AuthProvider><Consumer /></AuthProvider>);
  expect(screen.getByText('Visitante')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText(user.name)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(screen.getByText('Visitante')).toBeInTheDocument();
});
