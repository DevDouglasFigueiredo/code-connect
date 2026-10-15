export type Session = { token: string; expiresAt: number };
const key = 'code-connect.session';
const eventName = 'code-connect:session';

export function readSession(): Session | null {
  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    try {
      const value = JSON.parse(raw) as Session;
      if (typeof value.token === 'string' && value.token && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()) return value;
    } catch { /* Discard invalid stored sessions. */ }
    storage.removeItem(key);
  }
  return null;
}

export function saveSession(session: Session, rememberMe: boolean) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  (rememberMe ? localStorage : sessionStorage).setItem(key, JSON.stringify(session));
  window.dispatchEvent(new Event(eventName));
}

export function clearSession() {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  window.dispatchEvent(new Event(eventName));
}

export function subscribeSession(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener('storage', listener);
  };
}
