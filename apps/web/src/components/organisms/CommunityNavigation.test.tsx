import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { CommunityNavigation } from './CommunityNavigation';
it('shows login for guests and logout for a session', async () => {
  const logout = vi.fn(); const about = vi.fn();
  const { unmount } = renderCommunity(<CommunityNavigation signedIn={false} onLogout={logout} onAbout={about} />);
  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
  await userEvent.click(screen.getByRole('button', { name: 'Sobre nós' }));
  expect(about).toHaveBeenCalledOnce();
  unmount();
  renderCommunity(<CommunityNavigation signedIn onLogout={logout} onAbout={about} />);
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(logout).toHaveBeenCalledOnce();
});
