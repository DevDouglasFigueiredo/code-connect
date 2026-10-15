import { useEffect, useState, type ReactNode } from 'react';
import { getProfile, signIn, type LoginInput, type User } from '../services/auth';
import { errorMessage } from '../services/http';
import { AuthContext } from './auth-context';
import { clearSession, readSession, saveSession, subscribeSession } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readSession);
  const [profile, setProfile] = useState<{ token: string; user?: User; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => subscribeSession(() => setSession(readSession())), []);
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(clearSession, Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    getProfile(controller.signal).then((user) => {
      if (!controller.signal.aborted) setProfile({ token: session.token, user });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setProfile({ token: session.token, error: errorMessage(error) });
    });
    return () => controller.abort();
  }, [session, attempt]);

  async function login(input: LoginInput, rememberMe: boolean) {
    const token = await signIn(input);
    setProfile(null);
    saveSession({ token: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 }, rememberMe);
  }
  const current = session && profile?.token === session.token ? profile : null;
  return <AuthContext.Provider value={{
    user: current?.user ?? null,
    hasSession: !!session,
    loading: !!session && !current,
    error: current?.error ?? '',
    login,
    logout: clearSession,
    retry: () => { setProfile(null); setAttempt((value) => value + 1); },
  }}>{children}</AuthContext.Provider>;
}
