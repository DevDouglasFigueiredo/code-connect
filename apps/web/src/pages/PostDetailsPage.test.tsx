import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { expect, it } from 'vitest';
import { renderCommunity } from '../test/render-community';
import { post } from '../test/posts';
import { mockApi, respond } from '../test/http-adapter';
import { PostDetailsPage } from './PostDetailsPage';
it('renders details, escaped code and public comments', async () => {
  mockApi();
  renderCommunity(<Routes><Route path="/posts/:id" element={<PostDetailsPage />} /></Routes>, {}, '/posts/post-1');
  expect(await screen.findByRole('heading', { name: post.title })).toBeInTheDocument();
  expect(screen.getByText(post.code!)).toBeInTheDocument();
  expect(document.querySelector('code script')).toBeNull();
  expect(await screen.findByRole('heading', { name: 'Comentários' })).toBeInTheDocument();
});
it('shows a missing post and a route back to the feed', async () => {
  mockApi().mockImplementation(async (config) => respond(config, {}, 404));
  renderCommunity(<Routes><Route path="/posts/:id" element={<PostDetailsPage />} /></Routes>, {}, '/posts/missing');
  expect(await screen.findByRole('alert')).toHaveTextContent('não foi encontrado');
  expect(screen.getByRole('link', { name: '← Voltar ao feed' })).toHaveAttribute('href', '/');
});
