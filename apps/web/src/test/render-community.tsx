import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext, type AuthState } from '../auth/auth-context';

export function renderCommunity(ui: ReactNode, overrides: Partial<AuthState> = {}, path = '/') {
  const auth: AuthState = { user: null, hasSession: false, loading: false, error: '', login: vi.fn(), logout: vi.fn(), retry: vi.fn(), ...overrides };
  return { ...render(<MemoryRouter initialEntries={[path]}><AuthContext.Provider value={auth}>{ui}</AuthContext.Provider></MemoryRouter>), auth };
}
