import { LocationObserver } from '../../test/LocationObserver';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { collection, comment } from '../../test/posts';
import { mockApi, respond } from '../../test/http-adapter';
import { CommentThread } from './CommentThread';
it('loads and hides replies without offering a deeper reply action', async () => {
  const adapter = mockApi();
  adapter.mockImplementation(async (config) => respond(config, collection([{ ...comment, id: 'reply', parentId: comment.id, text: 'Obrigado!' }])));
  renderCommunity(<ul><CommentThread comment={comment} onCreated={vi.fn()} /></ul>);
  expect(screen.getByText(comment.text)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Ver respostas (1)' }));
  expect(await screen.findByText('Obrigado!')).toBeInTheDocument();
  expect(adapter.mock.calls[0][0].params.parentId).toBe(comment.id);
  expect(screen.getAllByRole('button', { name: 'Responder' })).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: 'Ocultar respostas' }));
  expect(screen.queryByText('Obrigado!')).not.toBeInTheDocument();
});
it('redirects guests before opening the reply form', async () => {
  renderCommunity(<><ul><CommentThread comment={comment} onCreated={vi.fn()} /></ul><LocationObserver /></>, {}, '/posts/post-1');
  await userEvent.click(screen.getByRole('button', { name: 'Responder' }));
  expect(screen.getByTestId('location')).toHaveTextContent('/login');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it('sends an authenticated reply to its root comment', async () => {
  const adapter = mockApi(); const created = vi.fn();
  adapter.mockImplementation(async (config) => config.method === 'post' ? respond(config, { data: { ...comment, parentId: comment.id } }) : respond(config, collection([])));
  renderCommunity(<ul><CommentThread comment={comment} onCreated={created} /></ul>, { hasSession: true });
  await userEvent.click(screen.getByRole('button', { name: 'Responder' }));
  await userEvent.type(screen.getByLabelText('Responder a Marcia Santos'), 'Uma resposta');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar comentário' }));
  expect(JSON.parse(adapter.mock.calls.find(([config]) => config.method === 'post')![0].data)).toEqual({ text: 'Uma resposta', parentId: comment.id });
  expect(await screen.findByRole('button', { name: 'Ocultar respostas' })).toBeInTheDocument();
  expect(created).toHaveBeenCalledOnce();
});
