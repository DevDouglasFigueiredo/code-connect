import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwt = new JwtService({ secret: 'unit-test-secret', signOptions: { expiresIn: 3600, algorithm: 'HS256' } });
  const users = new UsersService();
  const auth = new AuthService(users, jwt);

  it('issues a one-hour JWT identifying the user without sensitive fields', async () => {
    const input = { name: 'Ana', email: 'ana@example.com', password: 'password123' };
    const user = await users.create(input);
    const token = await auth.login(input);
    const payload = await jwt.verifyAsync<{ sub: string; iat: number; exp: number }>(token.access_token);
    expect(payload.sub).toBe(user.id);
    expect(payload.exp - payload.iat).toBe(3600);
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'sub']);
    expect(token).toMatchObject({ token_type: 'Bearer', expires_in: 3600 });
  });

  it('returns the same error for a wrong password and a missing account', async () => {
    await expect(auth.login({ email: 'ana@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
    await expect(auth.login({ email: 'missing@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
  });
});
