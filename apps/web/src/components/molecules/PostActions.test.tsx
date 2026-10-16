import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { PostActions } from './PostActions';
it('exposes like state, share and comment navigation', async () => {
  const like = vi.fn(); const share = vi.fn();
  renderCommunity(<PostActions id="post" liked likes={3} comments={2} pending={false} onLike={like} onShare={share} />);
  const button = screen.getByRole('button', { name: 'Remover curtida' });
  expect(button).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(button); await userEvent.click(screen.getByRole('button', { name: 'Compartilhar post' }));
  expect(like).toHaveBeenCalledOnce(); expect(share).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: 'Ver comentários (2)' })).toHaveAttribute('href', '/posts/post#comentarios');
});
