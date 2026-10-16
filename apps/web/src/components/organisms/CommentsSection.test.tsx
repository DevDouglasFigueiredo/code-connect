import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { collection, comment } from '../../test/posts';
import { mockApi, respond } from '../../test/http-adapter';
import { CommentsSection } from './CommentsSection';
it('allows guests to read comments and links to login', async () => {
  mockApi(); renderCommunity(<CommentsSection postId="post-1" onCreated={vi.fn()} />, {}, '/posts/post-1');
  expect(await screen.findByText(comment.text)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it('creates comments for a session and refreshes the list', async () => {
  const adapter = mockApi(); const created = vi.fn(); let saved = false;
  adapter.mockImplementation(async (config) => {
    if (config.method === 'post') { saved = true; return respond(config, { data: comment }); }
    return respond(config, collection(saved ? [{ ...comment, text: 'Novo comentário' }] : []));
  });
  renderCommunity(<CommentsSection postId="post-1" onCreated={created} />, { hasSession: true });
  await screen.findByText('Nenhum comentário ainda. Comece a conversa!');
  await userEvent.type(screen.getByRole('textbox'), 'Novo comentário');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar comentário' }));
  expect(await screen.findByText('Novo comentário')).toBeInTheDocument();
  await waitFor(() => expect(created).toHaveBeenCalledOnce());
});
