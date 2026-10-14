import { UsersService } from './users.service';

describe('UsersService', () => {
  let users: UsersService;
  const input = { name: 'Ana', email: 'ana@example.com', password: ' password 123 ' };

  beforeEach(() => { users = new UsersService(); });

  it('stores salted hashes and only returns public fields', async () => {
    const user = await users.create(input);
    expect(Object.keys(user).sort()).toEqual(['email', 'id', 'name']);
    expect(users.findById(user.id)).toEqual(user);
    expect(await users.verifyCredentials(input.email, input.password)).toEqual(user);
    expect(await users.verifyCredentials(input.email, input.password.trim())).toBeUndefined();
    expect(await users.verifyCredentials('missing@example.com', input.password)).toBeUndefined();
    const storage = (users as unknown as { users: { salt: string; passwordHash: Buffer; password?: string }[] }).users;
    expect(storage[0].password).toBeUndefined();
    expect(storage[0].passwordHash).toHaveLength(64);
    expect(storage[0].passwordHash.toString()).not.toContain(input.password);
    await users.create({ ...input, email: 'other@example.com' });
    expect(storage[0].salt).not.toBe(storage[1].salt);
    expect(storage[0].passwordHash.equals(storage[1].passwordHash)).toBe(false);
  });

  it('rejects duplicates even during concurrent creation', async () => {
    const results = await Promise.allSettled([users.create(input), users.create(input)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });

  it('starts each store empty', async () => {
    const user = await users.create(input);
    expect(new UsersService().findById(user.id)).toBeUndefined();
  });
});
