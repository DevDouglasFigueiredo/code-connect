import { validateConfiguration } from './configuration';

describe('Configuration', () => {
  it.each([undefined, null, '', '   ', 123])('rejects an invalid JWT_SECRET: %j', (JWT_SECRET) => {
    expect(() => validateConfiguration({ JWT_SECRET })).toThrow('JWT_SECRET must be configured');
  });

  it('accepts an explicitly configured secret', () => {
    expect(validateConfiguration({ JWT_SECRET: 'test-secret' })).toEqual({ JWT_SECRET: 'test-secret' });
  });
});
