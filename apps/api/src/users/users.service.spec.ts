import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let users: UsersService;
  const input = { name: 'Ana', email: 'ana@example.com', password: ' password 123 ' };
  const repository = {
    create: jest.fn((value: User) => value),
    save: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const query = { addSelect: jest.fn(), where: jest.fn(), getOne: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
    repository.create.mockImplementation((value: User) => value);
    repository.save.mockImplementation(async (value: User) => value);
    repository.createQueryBuilder.mockReturnValue(query);
    query.addSelect.mockReturnValue(query);
    query.where.mockReturnValue(query);
    users = new UsersService(repository as unknown as Repository<User>);
  });

  it('persists salted hashes and exposes only public fields', async () => {
    const user = await users.create(input);
    const stored = repository.save.mock.calls[0][0] as User;
    expect(user).toEqual({ id: expect.any(String), name: input.name, email: input.email });
    expect(stored).not.toHaveProperty('password');
    expect(stored.salt).toHaveLength(32);
    expect(stored.passwordHash).toHaveLength(64);
    expect(stored.passwordHash.toString()).not.toContain(input.password);
    await users.create({ ...input, email: 'other@example.com' });
    const other = repository.save.mock.calls[1][0] as User;
    expect(stored.salt).not.toBe(other.salt);
    expect(stored.passwordHash.equals(other.passwordHash)).toBe(false);
    repository.findOneBy.mockResolvedValue(stored);
    expect(await users.findById(user.id)).toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    query.getOne.mockResolvedValue(stored);
    expect(await users.verifyCredentials(input.email, input.password)).toEqual(user);
    expect(await users.verifyCredentials(input.email, input.password.trim())).toBeUndefined();
    expect(query.addSelect).toHaveBeenCalledWith(['user.salt', 'user.passwordHash']);
    expect(query.where).toHaveBeenCalledWith('user.email = :email', { email: input.email });
  });

  it('returns undefined for missing users and invalid credentials', async () => {
    repository.findOneBy.mockResolvedValue(null);
    query.getOne.mockResolvedValue(null);
    expect(await users.findById('missing')).toBeUndefined();
    expect(await users.verifyCredentials(input.email, input.password)).toBeUndefined();
  });

  it('maps the database unique constraint to the existing duplicate-email error', async () => {
    repository.save.mockRejectedValue(new QueryFailedError('INSERT', [], Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' })));
    await expect(users.create(input)).rejects.toMatchObject({ status: 422, message: 'Email already registered' });
  });

  it('propagates unexpected database errors', async () => {
    const error = new Error('Database unavailable');
    repository.save.mockRejectedValue(error);
    await expect(users.create(input)).rejects.toBe(error);
    repository.findOneBy.mockRejectedValue(error);
    await expect(users.findById('id')).rejects.toBe(error);
    query.getOne.mockRejectedValue(error);
    await expect(users.verifyCredentials(input.email, input.password)).rejects.toBe(error);
  });
});
