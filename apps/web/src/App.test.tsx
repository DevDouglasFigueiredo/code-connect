import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from './App';

it.each(['/', '/login', '/desconhecido'])('opens login at %s', (path) => {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
});

it('opens registration directly and navigates in both directions', async () => {
  render(<MemoryRouter initialEntries={['/cadastro']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: 'Faça seu login!' }));
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }));
  expect(screen.getByRole('form', { name: 'Cadastro' })).toBeInTheDocument();
});
