import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { DataSource, IsNull } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { seedDatabase, seedId } from '../src/database/seed';
import { Post } from '../src/posts/post.entity';
import { PostLike } from '../src/posts/like.entity';
import { PostComment } from '../src/posts/comment.entity';
import { User } from '../src/users/user.entity';
import { CommentDto, PostDetailDto } from '../src/posts/dto/post-response.dto';

type PostResponse = { data: PostDetailDto };
type CommentResponse = { data: CommentDto };
type Collection = { data: PostDetailDto[]; meta: { page: number; limit: number; total: number; totalPages: number }; links: { next?: string } };

describe('Posts API (MySQL e2e)', () => {
  let app: INestApplication;
  let database: DataSource;
  let token: string;
  let otherToken: string;
  let userId: string;
  let postId: string;
  let otherPostId: string;
  let rootId: string;
  let replyId: string;
  const jwt = new JwtService({ secret: process.env.JWT_SECRET, signOptions: { algorithm: 'HS256', expiresIn: 3600 } });
  const server = (): Parameters<typeof request>[0] => app.getHttpServer() as Parameters<typeof request>[0];

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    database = app.get(DataSource);
    const options = database.options;
    if (options.type !== 'mysql' || options.database !== 'code_connect_test' || options.host !== '127.0.0.1' ||
      options.port !== 3307 || options.username !== 'code_connect_test') throw new Error('Refusing to modify a non-test database');
    await database.runMigrations();
    await database.query('DELETE FROM users');
    // Exercise only the new migration; never revert the existing users migration.
    const migrations = await database.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1') as { name: string }[];
    expect(migrations[0].name).toBe('CreatePosts1792108800000');
    const legacyId = randomUUID();
    await database.getRepository(User).insert({ id: legacyId, name: 'Legacy', email: 'legacy@example.com', salt: '0'.repeat(32), passwordHash: Buffer.alloc(64) });
    await database.undoLastMigration();
    const runner = database.createQueryRunner();
    try { expect(await runner.hasTable('posts')).toBe(false); } finally { await runner.release(); }
    expect(await database.getRepository(User).existsBy({ id: legacyId })).toBe(true);
    await database.runMigrations();
    await database.getRepository(User).delete(legacyId);
    for (const [index, name] of ['Ana', 'Bruno'].entries()) {
      const result = await request(server()).post('/users').send({ name, email: `posts-${index}@example.com`, password: 'test-password' }).expect(201);
      const id = (result.body as { data: { id: string } }).data.id;
      const accessToken = await jwt.signAsync({ sub: id });
      if (index === 0) { token = accessToken; userId = id; } else otherToken = accessToken;
    }
  });

  afterAll(async () => {
    try { if (database?.isInitialized) await database.query('DELETE FROM users'); }
    finally { await app?.close(); }
  });

  it('lists an empty public feed with pagination and cache policy', async () => {
    const result = await request(server()).get('/posts').expect(200).expect('Cache-Control', 'no-store');
    expect(result.body).toMatchObject({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('rejects anonymous writes, invalid tokens and tokens belonging to removed users', async () => {
    await request(server()).post('/posts').send({}).expect(401);
    await request(server()).put(`/posts/${randomUUID()}/likes/me`).expect(401);
    await request(server()).delete(`/posts/${randomUUID()}/likes/me`).expect(401);
    await request(server()).post(`/posts/${randomUUID()}/comments`).send({ text: 'Hi' }).expect(401);
    const invalid = ['Bearer invalid', 'Basic abc', `Bearer ${await jwt.signAsync({ sub: randomUUID() })}`,
      `Bearer ${await jwt.signAsync({ sub: userId }, { expiresIn: -1 })}`];
    for (const authorization of invalid) {
      await request(server()).get('/posts').set('Authorization', authorization).expect(401);
      await request(server()).post('/posts').set('Authorization', authorization).send({}).expect(401);
    }
  });

  it('creates normalized posts, preserves code and omits private author fields', async () => {
    const result = await request(server()).post('/posts').auth(token, { type: 'bearer' }).send({
      title: '  Acessibilidade React  ', description: 'Interfaces inclusivas com componentes reutilizáveis.',
      code: '  const uniqueSnippet = "<script>alert(1)</script>";\n', tags: [' Front-end ', 'React'],
    }).expect(201).expect('Content-Type', /json/).expect('Cache-Control', 'no-store');
    const post = (result.body as PostResponse).data;
    postId = post.id;
    expect(result.headers.location).toBe(`/posts/${postId}`);
    expect(post).toMatchObject({ title: 'Acessibilidade React', tags: ['Front-end', 'React'], code: '  const uniqueSnippet = "<script>alert(1)</script>";\n',
      thumbnailUrl: null, author: { id: userId, name: 'Ana' }, likesCount: 0, commentsCount: 0, likedByMe: false });
    expect(Object.keys(post.author).sort()).toEqual(['id', 'name']);
    expect(post).not.toHaveProperty('searchText');
    const other = await request(server()).post('/posts').auth(otherToken, { type: 'bearer' }).send({
      title: 'NestJS no servidor', description: 'Backend com persistência relacional.', code: null,
      thumbnailUrl: 'https://example.com/demo.png', tags: ['MySQL'],
    }).expect(201);
    otherPostId = (other.body as PostResponse).data.id;
  });

  it.each([
    {}, { title: '', description: 'text' }, { title: 'x'.repeat(161), description: 'text' },
    { title: 'Title', description: ' ' }, { title: 'Title', description: 'x'.repeat(5001) },
    { title: 'Title', description: 'text', code: 'x'.repeat(50001) },
    { title: 'Title', description: 'text', thumbnailUrl: 'javascript:alert(1)' },
    { title: 'Title', description: 'text', thumbnailUrl: '' },
    { title: 'Title', description: 'text', tags: ['react', 'React'] },
    { title: 'Title', description: 'text', tags: Array.from({ length: 11 }, (_, index) => `tag-${index}`) },
    { title: 'Title', description: 'text', tags: ['x'.repeat(31)] },
    { title: 'Title', description: 'text', tags: [' '] },
    { title: 'Title', description: 'text', tags: [42] },
    { title: 'Title', description: 'text', tags: null },
    { title: 'Title', description: 'text', authorId: randomUUID() },
  ])('validates post input %#', async (payload) => {
    const result = await request(server()).post('/posts').auth(token, { type: 'bearer' }).send(payload).expect(422);
    expect(result.body).toMatchObject({ statusCode: 422, errors: expect.any(Array) });
  });

  it('accepts the maximum code size with multibyte characters', async () => {
    const code = '漢'.repeat(50_000);
    const result = await request(server()).post('/posts').auth(token, { type: 'bearer' }).send({ title: 'Large snippet', description: 'Unicode example', code }).expect(201);
    const id = (result.body as PostResponse).data.id;
    try {
      expect((result.body as PostResponse).data.code).toBe(code);
    } finally {
      await database.getRepository(Post).delete(id);
    }
  });

  it('reads public details and performs indexed full-text search across all fields', async () => {
    await request(server()).get(`/posts/${postId}`).expect(200);
    for (const q of ['acessibilidade', 'ACESSIBILIDADE', 'reutilizaveis', 'uniqueSnippet', 'front', 'react interfaces']) {
      const result = await request(server()).get('/posts').query({ q }).expect(200);
      expect((result.body as Collection).data.map((post) => post.id)).toEqual([postId]);
    }
    const tagOnly = await request(server()).get('/posts').query({ q: 'mysql' }).expect(200);
    expect((tagOnly.body as Collection).data.map((post) => post.id)).toEqual([otherPostId]);
    const empty = await request(server()).get('/posts').query({ q: 'React MySQL' }).expect(200);
    expect((empty.body as Collection).data).toEqual([]);
    const syntax = await request(server()).get('/posts').query({ q: '+-()' }).expect(200);
    expect((syntax.body as Collection).data).toEqual([]);
    const recent = await request(server()).get('/posts').query({ limit: 1 }).expect(200);
    expect((recent.body as Collection).data[0].id).toBe(otherPostId);
    expect((recent.body as Collection).data[0]).not.toHaveProperty('code');
    expect((recent.body as Collection).meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    await request(server()).get((recent.body as Collection).links.next!).expect(200);
    const far = await request(server()).get('/posts?page=20').expect(200);
    expect((far.body as Collection).data).toEqual([]);
  });

  it.each(['page=0', 'page=1.5', 'limit=101', 'limit=0', 'limit=', 'page[]=1', 'q[]=x', 'sort=unknown', 'unknown=1', 'q=' + 'x'.repeat(201)])('rejects query %s', async (query) => {
    await request(server()).get(`/posts?${query}`).expect(422);
  });

  it('handles concurrent likes, per-user state, ordering and repeated removal', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => request(server()).put(`/posts/${postId}/likes/me`).auth(token, { type: 'bearer' })));
    expect(results.map((result) => result.status).sort()).toEqual([201, 204, 204, 204, 204]);
    expect(results.find((result) => result.status === 201)?.headers.location).toBe(`/posts/${postId}/likes/me`);
    expect(results.filter((result) => result.status === 204).every((result) => result.text === '')).toBe(true);
    await request(server()).put(`/posts/${postId}/likes/me`).auth(otherToken, { type: 'bearer' }).expect(201);
    const mine = await request(server()).get(`/posts/${postId}`).auth(token, { type: 'bearer' }).expect(200);
    expect((mine.body as PostResponse).data).toMatchObject({ likesCount: 2, likedByMe: true });
    const publicView = await request(server()).get(`/posts/${postId}`).expect(200);
    expect((publicView.body as PostResponse).data.likedByMe).toBe(false);
    const sorted = await request(server()).get('/posts?sort=likes').auth(token, { type: 'bearer' }).expect(200);
    expect((sorted.body as Collection).data[0]).toMatchObject({ id: postId, likedByMe: true });
    for (let index = 0; index < 2; index++) {
      const removed = await request(server()).delete(`/posts/${postId}/likes/me`).auth(token, { type: 'bearer' }).expect(204);
      expect(removed.text).toBe('');
    }
    const after = await request(server()).get(`/posts/${postId}`).auth(token, { type: 'bearer' }).expect(200);
    expect((after.body as PostResponse).data).toMatchObject({ likesCount: 1, likedByMe: false });
  });

  it('creates comments and one-level replies, with public pagination and navigation', async () => {
    const root = await request(server()).post(`/posts/${postId}/comments`).auth(token, { type: 'bearer' }).send({ text: '  Ótimo projeto!  ' }).expect(201);
    rootId = (root.body as CommentResponse).data.id;
    expect(root.headers.location).toBe(`/posts/${postId}/comments/${rootId}`);
    expect((root.body as CommentResponse).data).toMatchObject({ text: 'Ótimo projeto!', parentId: null, repliesCount: 0 });
    const reply = await request(server()).post(`/posts/${postId}/comments`).auth(otherToken, { type: 'bearer' }).send({ text: 'Obrigado!', parentId: rootId }).expect(201);
    replyId = (reply.body as CommentResponse).data.id;
    await request(server()).get(reply.headers.location as string).expect(200);
    const roots = await request(server()).get(`/posts/${postId}/comments?limit=1`).expect(200);
    expect((roots.body as { data: CommentDto[] }).data).toHaveLength(1);
    expect((roots.body as { data: CommentDto[] }).data[0]).toMatchObject({ id: rootId, repliesCount: 1 });
    const replies = await request(server()).get(`/posts/${postId}/comments`).query({ parentId: rootId }).expect(200);
    expect((replies.body as { data: CommentDto[] }).data.map((comment) => comment.id)).toEqual([replyId]);
    const details = await request(server()).get(`/posts/${postId}`).expect(200);
    expect((details.body as PostResponse).data.commentsCount).toBe(2);
    await request(server()).post(`/posts/${postId}/comments`).auth(token, { type: 'bearer' }).send({ text: 'Second comment' }).expect(201);
    const page = await request(server()).get(`/posts/${postId}/comments?limit=1&page=2`).expect(200);
    expect((page.body as { data: CommentDto[] }).data[0].text).toBe('Second comment');
  });

  it('rejects nested replies and parents from other posts', async () => {
    await request(server()).post(`/posts/${postId}/comments`).auth(token, { type: 'bearer' }).send({ text: 'Nested', parentId: replyId }).expect(422);
    await request(server()).post(`/posts/${otherPostId}/comments`).auth(token, { type: 'bearer' }).send({ text: 'Wrong post', parentId: rootId }).expect(404);
    await request(server()).get(`/posts/${otherPostId}/comments`).query({ parentId: rootId }).expect(404);
    await request(server()).get(`/posts/${postId}/comments`).query({ parentId: replyId }).expect(422);
    await request(server()).get(`/posts/${otherPostId}/comments/${rootId}`).expect(404);
  });

  it.each([{}, { text: '' }, { text: ' ' }, { text: 'x'.repeat(2001) }, { text: 'Hello', parentId: null }, { text: 'Hello', parentId: 'invalid' }, { text: 'Hello', authorId: randomUUID() }])('validates comment input %#', async (payload) => {
    await request(server()).post(`/posts/${postId}/comments`).auth(token, { type: 'bearer' }).send(payload).expect(422);
  });

  it('returns consistent missing-resource and malformed-ID errors', async () => {
    const id = randomUUID();
    for (const path of [`/posts/${id}`, `/posts/${id}/comments`, `/posts/${postId}/comments/${id}`]) {
      await request(server()).get(path).expect(404);
    }
    await request(server()).put(`/posts/${id}/likes/me`).auth(token, { type: 'bearer' }).expect(404);
    await request(server()).delete(`/posts/${id}/likes/me`).auth(token, { type: 'bearer' }).expect(404);
    await request(server()).post(`/posts/${id}/comments`).auth(token, { type: 'bearer' }).send({ text: 'Hi' }).expect(404);
    await request(server()).get('/posts/not-a-uuid').expect(422);
  });

  it('supports public HEAD, OPTIONS and authenticated cross-origin PUT/DELETE', async () => {
    for (const path of ['/posts', `/posts/${postId}`, `/posts/${postId}/comments`, `/posts/${postId}/comments/${rootId}`]) {
      const head = await request(server()).head(path).expect(200);
      expect(head.text).toBeUndefined();
      await request(server()).options(path).expect(204);
    }
    const preflight = await request(server()).options(`/posts/${postId}/likes/me`)
      .set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'authorization').expect(204).expect('Allow', 'PUT, DELETE, OPTIONS');
    expect(preflight.headers['access-control-allow-methods']).toContain('PUT');
    expect(preflight.headers['access-control-allow-methods']).toContain('DELETE');
  });

  it('documents public and authenticated contracts without response bodies for 204', async () => {
    const result = await request(server()).get('/docs-json').expect(200);
    const doc = result.body as { paths: Record<string, Record<string, { security: unknown; responses: Record<string, { content?: unknown; headers?: Record<string, unknown> }> }>> };
    expect(doc.paths['/posts'].get.security).toEqual([{}, { bearer: [] }]);
    expect(doc.paths['/posts'].post.security).toEqual([{ bearer: [] }]);
    const likes = doc.paths['/posts/{id}/likes/me'];
    expect(likes.put.responses['201'].headers?.Location).toBeDefined();
    expect(likes.put.responses['204'].content).toBeUndefined();
    expect(likes.delete.responses['204'].content).toBeUndefined();
    expect(likes.delete.responses['500'].content).toBeDefined();
  });

  it('rolls back seed inserts on email conflicts without replacing an existing user', async () => {
    const conflictId = randomUUID();
    await database.getRepository(User).insert({ id: conflictId, name: 'Existing account', email: 'demo2@example.com', salt: '0'.repeat(32), passwordHash: Buffer.alloc(64) });
    try {
      await expect(seedDatabase(database, 'demo-test-password')).rejects.toThrow();
      expect(await database.getRepository(User).existsBy({ id: seedId('user-0') })).toBe(false);
      expect((await database.getRepository(User).findOneByOrFail({ id: conflictId })).name).toBe('Existing account');
    } finally {
      await database.getRepository(User).delete(conflictId);
    }
  });

  it('seeds twice without duplicating or overwriting records, with searchable fixtures', async () => {
    await seedDatabase(database, 'demo-test-password');
    const counts = async () => Promise.all([database.getRepository(User).count(), database.getRepository(Post).count(),
      database.getRepository(PostLike).count(), database.getRepository(PostComment).count()]);
    const before = await counts();
    expect(before[0]).toBe(5);
    expect(before[1]).toBe(32);
    expect(before[3]).toBe(63);
    await database.getRepository(PostComment).update(seedId('comment-0'), { text: 'Manual edit' });
    await seedDatabase(database, 'different-password');
    expect(await counts()).toEqual(before);
    expect((await database.getRepository(PostComment).findOneByOrFail({ id: seedId('comment-0') })).text).toBe('Manual edit');
    const result = await request(server()).get('/posts?q=responsivos').expect(200);
    expect((result.body as Collection).meta.total).toBe(5);
    await request(server()).post('/sessions').send({ email: 'demo1@example.com', password: 'demo-test-password' }).expect(200);
    expect(await database.getRepository(Post).countBy({ thumbnailUrl: IsNull() })).toBeGreaterThan(0);
  });
});
