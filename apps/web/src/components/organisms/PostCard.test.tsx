import { LocationObserver } from '../../test/LocationObserver';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { post } from '../../test/posts';
import { mockApi, respond } from '../../test/http-adapter';
import { PostCard } from './PostCard';
it('renders content and sends anonymous likes to login without writing', async () => {
  const adapter = mockApi();
  renderCommunity(<><PostCard post={post} onUpdate={vi.fn()} /><LocationObserver /></>, {}, '/?q=React');
  expect(screen.getByRole('link', { name: post.title })).toHaveAttribute('href', '/posts/post-1');
  await userEvent.click(screen.getByRole('button', { name: 'Curtir post' }));
  expect(adapter).not.toHaveBeenCalled();
  expect(screen.getByTestId('location')).toHaveTextContent('"from":"/?q=React"');
});
it('updates from server counts after a signed-in like', async () => {
  const adapter = mockApi(); const update = vi.fn();
  adapter.mockImplementation(async (config) => respond(config, { data: { ...post, likesCount: 3, likedByMe: true } }));
  renderCommunity(<PostCard post={post} onUpdate={update} />, { hasSession: true });
  await userEvent.click(screen.getByRole('button', { name: 'Curtir post' }));
  await waitFor(() => expect(update).toHaveBeenCalledWith(expect.objectContaining({ likesCount: 3, likedByMe: true })));
  expect(adapter.mock.calls.map(([config]) => config.method)).toEqual(['put', 'get']);
});
it('copies the canonical post URL', async () => {
  const browser = userEvent.setup();
  renderCommunity(<PostCard post={post} onUpdate={vi.fn()} />);
  await browser.click(screen.getByRole('button', { name: 'Compartilhar post' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Link copiado');
  expect(await navigator.clipboard.readText()).toContain('/posts/post-1');
});
it('announces a failed like without changing displayed counters', async () => {
  mockApi().mockRejectedValue(new Error('offline'));
  renderCommunity(<PostCard post={post} onUpdate={vi.fn()} />, { hasSession: true });
  await userEvent.click(screen.getByRole('button', { name: 'Curtir post' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Curtir post' })).toHaveAttribute('aria-pressed', 'false');
});
