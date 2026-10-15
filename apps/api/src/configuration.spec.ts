import { validateConfiguration } from './configuration';
import { databaseOptions } from './database/database-options';

const database = { DB_HOST: '127.0.0.1', DB_NAME: 'test', DB_USER: 'test', DB_PASSWORD: 'test' };

describe('Configuration', () => {
  it.each([undefined, null, '', '   ', 123])('rejects an invalid JWT_SECRET: %j', (JWT_SECRET) => {
    expect(() => validateConfiguration({ ...database, JWT_SECRET })).toThrow('JWT_SECRET must be configured');
  });

  it('accepts an explicitly configured secret and defaults to the MySQL port', () => {
    expect(validateConfiguration({ ...database, JWT_SECRET: 'test-secret' }))
      .toEqual({ ...database, JWT_SECRET: 'test-secret', DB_PORT: 3306 });
  });

  it.each(['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'])('requires %s', (key) => {
    for (const value of [undefined, '', '  ', 123]) {
      expect(() => validateConfiguration({ ...database, JWT_SECRET: 'test', [key]: value }))
        .toThrow(`${key} must be configured`);
    }
  });

  it.each(['', 'abc', 0, 65536, 1.5])('rejects invalid database port %j', (DB_PORT) => {
    expect(() => databaseOptions({ ...database, DB_PORT })).toThrow('DB_PORT must be an integer');
  });

  it('normalizes the database port and disables automatic schema changes', () => {
    expect(databaseOptions({ ...database, DB_PORT: '3307' }))
      .toMatchObject({ port: 3307, synchronize: false, migrationsRun: false, type: 'mysql' });
  });
});
