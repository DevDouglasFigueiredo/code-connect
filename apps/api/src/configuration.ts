import { validateDatabaseConfiguration } from './database/database-options';

export function validateConfiguration(config: Record<string, unknown>): Record<string, unknown> {
  if (typeof config.JWT_SECRET !== 'string' || !config.JWT_SECRET.trim()) {
    throw new Error('JWT_SECRET must be configured');
  }
  return validateDatabaseConfiguration(config);
}
