import { join } from 'node:path';
import { type DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';

export function validateDatabaseConfiguration(config: Record<string, unknown>): Record<string, unknown> {
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (typeof config[key] !== 'string' || !config[key].trim()) {
      throw new Error(`${key} must be configured`);
    }
  }
  const port = Number(config.DB_PORT ?? 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }
  return { ...config, DB_PORT: port };
}

export function databaseOptions(config: Record<string, unknown>): DataSourceOptions {
  const validated = validateDatabaseConfiguration(config);
  return {
    type: 'mysql',
    host: validated.DB_HOST as string,
    port: validated.DB_PORT as number,
    username: validated.DB_USER as string,
    password: validated.DB_PASSWORD as string,
    database: validated.DB_NAME as string,
    charset: 'utf8mb4_bin',
    entities: [User],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    migrationsRun: false,
  };
}
