import database from './data-source';
import { seedDatabase } from './seed';

async function main(): Promise<void> {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error('Set SEED_PASSWORD before running the seed');
  await database.initialize();
  try {
    await seedDatabase(database, password);
    console.log('Demo seed complete: 3 users, 30 posts and their interactions. Existing records preserved.');
  } finally {
    await database.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
