import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from './App';

it('opens the login page by default', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByRole('form', { name: 'Login' })).toBeInTheDocument();
});
