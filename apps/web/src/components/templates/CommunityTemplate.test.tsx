import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { renderCommunity } from '../../test/render-community';
import { CommunityTemplate } from './CommunityTemplate';
it('composes navigation, branding and its page content', async () => {
  renderCommunity(<CommunityTemplate><h1>Meu feed</h1></CommunityTemplate>);
  expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Meu feed' }));
  expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar');
  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Sobre nós' }));
  expect(screen.getByRole('status')).toHaveTextContent('estará disponível em breve');
});
