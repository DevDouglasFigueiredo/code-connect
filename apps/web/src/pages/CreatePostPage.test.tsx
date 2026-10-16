import { LocationObserver } from '../test/LocationObserver';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { renderCommunity } from '../test/render-community';
import { mockApi } from '../test/http-adapter';
import { CreatePostPage } from './CreatePostPage';
it('creates a post through the API and opens its details', async () => {
  const adapter = mockApi();
  renderCommunity(<><CreatePostPage /><LocationObserver /></>, { hasSession: true }, '/publicar');
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Projeto');
  await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição');
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }));
  await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/posts/post-1'));
  expect(adapter.mock.calls[0][0].method).toBe('post');
});
