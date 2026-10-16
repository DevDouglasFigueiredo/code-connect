// Accept only internal destinations; never redirect to an external URL after sign-in.
export function returnTo(state: unknown): string {
  const value = state && typeof state === 'object' && 'from' in state ? state.from : null;
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') &&
    !value.includes('\\') && !Array.from(value).some((character) => character.charCodeAt(0) <= 32) && !/^\/(login|cadastro)(?:[/?#]|$)/.test(value) ? value : '/';
}
