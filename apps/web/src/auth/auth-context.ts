import { createContext, useContext } from 'react';
import type { LoginInput, User } from '../services/auth';

export type AuthState = {
  user: User | null;
  hasSession: boolean;
  loading: boolean;
  error: string;
  login: (input: LoginInput, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  retry: () => void;
};
export const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
