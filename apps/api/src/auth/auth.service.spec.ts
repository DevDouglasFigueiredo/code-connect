import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwt = new JwtService({ secret: 'unit-test-secret', signOptions: { expiresIn: 3600, algorithm: 'HS256' } });
  const users = { verifyCredentials: jest.fn() };
  const auth = new AuthService(users as unknown as UsersService, jwt);

  beforeEach(() => jest.resetAllMocks());

  it('issues a one-hour JWT identifying the user without sensitive fields', async () => {
    const user = { id: 'test-user-id', name: 'Ana', email: 'ana@example.com' };
    users.verifyCredentials.mockResolvedValue(user);
    const input = { email: user.email, password: 'password123' };
    const token = await auth.login(input);
    expect(users.verifyCredentials).toHaveBeenCalledWith(input.email, input.password);
    const payload = await jwt.verifyAsync<{ sub: string; iat: number; exp: number }>(token.access_token);
    expect(payload.sub).toBe(user.id);
    expect(payload.exp - payload.iat).toBe(3600);
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'sub']);
    expect(token).toMatchObject({ token_type: 'Bearer', expires_in: 3600 });
  });

  it('returns the same error for a wrong password and a missing account', async () => {
    users.verifyCredentials.mockResolvedValue(undefined);
    await expect(auth.login({ email: 'ana@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
    await expect(auth.login({ email: 'missing@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
  });
});
