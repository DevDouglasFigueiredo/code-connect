import { expect, it } from 'vitest';
import { clearSession, readSession, saveSession } from './session';

it('moves the session between storage types and clears the previous credentials', () => {
  const session = { token: 'token', expiresAt: Date.now() + 60000 };
  saveSession(session, true);
  expect(localStorage.length).toBe(1);
  saveSession(session, false);
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(1);
  expect(readSession()).toEqual(session);
  saveSession(session, true);
  expect(sessionStorage.length).toBe(0);
  expect(readSession()).toEqual(session);
  clearSession();
  expect(readSession()).toBeNull();
});
