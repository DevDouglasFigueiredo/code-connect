import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { AuthContext, type AuthState } from '../auth/auth-context';
import { user } from '../test/http-adapter';
import { ProfilePage } from './ProfilePage';

function renderProfile(overrides: Partial<AuthState> = {}) {
  const state: AuthState = { user, hasSession: true, loading: false, error: '', login: vi.fn(), logout: vi.fn(), retry: vi.fn(), ...overrides };
  render(<AuthContext.Provider value={state}><ProfilePage /></AuthContext.Provider>);
  return state;
}
it('renders profile information and signs out', async () => {
  const state = renderProfile();
  expect(screen.getByText(user.name)).toBeInTheDocument();
  expect(screen.getByText(user.email)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(state.logout).toHaveBeenCalledOnce();
});
it('shows a loading state', () => {
  renderProfile({ user: null, loading: true });
  expect(screen.getByRole('status')).toHaveTextContent('Carregando perfil');
});
it('allows retrying after profile errors', async () => {
  const state = renderProfile({ user: null, error: 'Falha na conexão' });
  expect(screen.getByRole('alert')).toHaveTextContent('Falha na conexão');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(state.retry).toHaveBeenCalledOnce();
});
