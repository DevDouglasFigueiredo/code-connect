import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { UsersService } from '../src/users/users.service';

interface UserResponse { data: { id: string; name: string; email: string }; links: Record<string, string> }
interface TokenResponse { data: { access_token: string; token_type: string; expires_in: number }; links: Record<string, string> }

describe('Authentication API (e2e)', () => {
  let app: INestApplication;
  const input = { name: '  Ana Silva  ', email: '  ANA@Example.com  ', password: ' senha-segura-123 ' };
  let token: string;
  let user: UserResponse['data'];
  const jwt = new JwtService({ secret: process.env.JWT_SECRET, signOptions: { algorithm: 'HS256', expiresIn: 3600 } });
  const server = (): Parameters<typeof request>[0] => app.getHttpServer() as Parameters<typeof request>[0];

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('registers a normalized user without credentials and points to login', async () => {
    const response = await request(server()).post('/users').send(input).expect(201)
      .expect('Location', '/users/me').expect('Cache-Control', 'no-store').expect('Content-Type', /json/);
    const body = response.body as UserResponse;
    user = body.data;
    expect(user).toEqual({ id: expect.any(String), name: 'Ana Silva', email: 'ana@example.com' });
    expect(body.links).toEqual({ self: '/users/me', login: '/sessions' });
  });

  it('rejects duplicate email regardless of case and whitespace', async () => {
    const response = await request(server()).post('/users').send({ ...input, email: 'ana@example.com' }).expect(422);
    expect(response.body).toEqual({ statusCode: 422, message: 'Email already registered' });
  });

  it('allows exactly one simultaneous registration for the same email', async () => {
    const payload = { ...input, email: 'concurrent@example.com' };
    const results = await Promise.all([request(server()).post('/users').send(payload), request(server()).post('/users').send(payload)]);
    expect(results.map((result) => result.status).sort()).toEqual([201, 422]);
  });

  it.each([
    {}, { ...input, name: '   ' }, { ...input, name: 123 },
    { ...input, email: 'invalid' }, { ...input, email: null },
    { ...input, password: 'short' }, { ...input, password: 'x'.repeat(129) },
    { ...input, password: 12345678 }, { ...input, admin: true },
  ])('validates registration payload %j', async (payload) => {
    const response = await request(server()).post('/users').send(payload).expect(422).expect('Cache-Control', 'no-store');
    expect(response.body).toMatchObject({ statusCode: 422, message: 'Validation failed', errors: expect.any(Array) });
    expect(response.body).not.toHaveProperty('stack');
  });

  it('rejects malformed JSON with a consistent error', async () => {
    const response = await request(server()).post('/users').set('Content-Type', 'application/json').send('{').expect(400);
    expect(response.body).toMatchObject({ statusCode: 400, message: expect.any(String) });
    expect(Object.keys(response.body as object).sort()).toEqual(['message', 'statusCode']);
  });

  it('logs in with normalized email and returns a Bearer token', async () => {
    const response = await request(server()).post('/sessions').send({ email: input.email, password: input.password })
      .expect(200).expect('Cache-Control', 'no-store');
    const body = response.body as TokenResponse;
    token = body.data.access_token;
    expect(body.data).toEqual({ access_token: expect.any(String), token_type: 'Bearer', expires_in: 3600 });
    expect(body.links.profile).toBe('/users/me');
  });

  it('returns identical errors for wrong password and unknown email', async () => {
    const wrong = await request(server()).post('/sessions').send({ email: input.email, password: input.password.trim() }).expect(401);
    const missing = await request(server()).post('/sessions').send({ email: 'missing@example.com', password: input.password }).expect(401);
    expect(wrong.body).toEqual(missing.body);
    expect(wrong.body).toEqual({ statusCode: 401, message: 'Invalid email or password' });
  });

  it.each([{}, { email: 'bad', password: 'abc' }, { email: input.email, password: '' }, { email: input.email, password: input.password, rememberMe: true }])('validates login payload %j', async (payload) => {
    await request(server()).post('/sessions').send(payload).expect(422);
  });

  it('returns the actual user for a valid token', async () => {
    const response = await request(server()).get('/users/me').auth(token, { type: 'bearer' }).expect(200).expect('Cache-Control', 'no-store');
    expect(response.body).toEqual({ data: user, links: { self: '/users/me' } });
  });

  it('hides unexpected internal failures', async () => {
    const lookup = jest.spyOn(app.get(UsersService), 'findById').mockImplementationOnce(() => {
      throw new Error('Private internal failure');
    });
    try {
      const response = await request(server()).get('/users/me').auth(token, { type: 'bearer' })
        .expect(500).expect('Cache-Control', 'no-store');
      expect(response.body).toEqual({ statusCode: 500, message: 'Internal server error' });
    } finally {
      lookup.mockRestore();
    }
  });

  it.each(['', 'Basic abc', 'Bearer', 'Bearer abc', 'Bearer abc extra'])('rejects missing/malformed authorization %j', async (authorization) => {
    await request(server()).get('/users/me').set('Authorization', authorization).expect(401).expect('Cache-Control', 'no-store');
  });

  it('rejects expired, incorrectly signed, invalid-claim and unknown-user tokens', async () => {
    const tokens = await Promise.all([
      jwt.signAsync({ sub: user.id }, { expiresIn: -1 }),
      jwt.signAsync({ sub: user.id }, { secret: 'incorrect-key' }),
      jwt.signAsync({ sub: 'invalid-id' }),
      jwt.signAsync({ sub: randomUUID() }),
      jwt.signAsync({ sub: user.id }, { algorithm: 'HS384' }),
      new JwtService({ secret: process.env.JWT_SECRET }).signAsync({ sub: user.id }),
    ]);
    for (const invalidToken of tokens) {
      const response = await request(server()).get('/users/me').auth(invalidToken, { type: 'bearer' }).expect(401);
      expect(response.body).toEqual({ statusCode: 401, message: 'Invalid or missing token' });
    }
  });

  it('supports HEAD with the same authentication and no body', async () => {
    const success = await request(server()).head('/users/me').auth(token, { type: 'bearer' }).expect(200);
    const failure = await request(server()).head('/users/me').expect(401);
    expect(success.text).toBeUndefined();
    expect(failure.text).toBeUndefined();
  });

  it.each([
    ['/users', 'POST, OPTIONS'],
    ['/sessions', 'POST, OPTIONS'],
    ['/users/me', 'GET, HEAD, OPTIONS'],
  ])('supports OPTIONS discovery on %s', async (path, methods) => {
    const response = await request(server()).options(path).expect(204).expect('Allow', methods);
    expect(response.text).toBe('');
  });

  it('removes the scaffold route', async () => {
    await request(server()).get('/').expect(404);
  });

  it('serves Swagger UI and documents inputs, outputs, errors and bearer security', async () => {
    await request(server()).get('/docs/').expect(200).expect('Content-Type', /html/);
    const response = await request(server()).get('/docs-json').expect(200);
    const doc = response.body as {
      paths: Record<string, Record<string, { requestBody?: unknown; responses: Record<string, { headers?: Record<string, unknown>; content?: unknown }>; security?: unknown }>>;
      components: { schemas: Record<string, { properties: Record<string, unknown> }>; securitySchemes: Record<string, unknown> };
    };
    expect(Object.keys(doc.paths).sort()).toEqual(['/sessions', '/users', '/users/me']);
    expect(doc.paths['/users'].post.requestBody).toBeDefined();
    expect(doc.paths['/sessions'].post.requestBody).toBeDefined();
    expect(doc.paths['/users'].post.responses['201'].headers?.Location).toBeDefined();
    expect(doc.paths['/users'].post.responses['422'].content).toBeDefined();
    expect(doc.paths['/sessions'].post.responses['200'].content).toBeDefined();
    expect(doc.paths['/users/me'].get.security).toEqual([{ bearer: [] }]);
    expect(doc.paths['/users/me'].get.responses['401'].content).toBeDefined();
    expect(doc.paths['/users/me'].get.responses['200'].headers?.['Cache-Control']).toBeDefined();
    expect(doc.components.securitySchemes.bearer).toMatchObject({ type: 'http', scheme: 'bearer' });
    expect(Object.keys(doc.components.schemas.UserDto.properties).sort()).toEqual(['email', 'id', 'name']);
    expect(doc.components.schemas.UserResponseDto.properties).toHaveProperty('data');
    expect(doc.components.schemas.TokenResponseDto.properties).toHaveProperty('data');
    expect(doc.components.schemas.CreateUserDto.properties.password).toMatchObject({ writeOnly: true, minLength: 8, maxLength: 128 });
  });
});
