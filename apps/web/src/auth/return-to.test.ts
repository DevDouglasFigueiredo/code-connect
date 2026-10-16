import { expect, it } from 'vitest';
import { returnTo } from './return-to';
it.each([null, {}, { from: '//evil.example' }, { from: 'https://evil.example' }, { from: '/\\evil.example' }, { from: '/login' }, { from: '/\n/evil.example' }])('rejects unsafe return paths %j', (state) => {
  expect(returnTo(state)).toBe('/');
});
it('preserves internal paths, queries and anchors', () => {
  expect(returnTo({ from: '/posts/post?q=React#comentarios' })).toBe('/posts/post?q=React#comentarios');
});
