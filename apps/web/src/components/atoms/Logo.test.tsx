import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Logo } from './Logo';
it('renders the existing local brand assets', () => {
  const { container } = render(<Logo />);
  expect(screen.getByRole('img', { name: 'Code Connect' })).toBeInTheDocument();
  expect([...container.querySelectorAll('img')].every((img) => img.getAttribute('src')?.startsWith('/auth/'))).toBe(true);
});
