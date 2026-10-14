import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AuthBanner } from './AuthBanner';

it('renders a replacement banner with its accessible description', () => {
  render(<AuthBanner src="/cadastro.png" alt="Banner de cadastro" />);
  expect(screen.getByRole('img', { name: 'Banner de cadastro' })).toHaveAttribute('src', '/cadastro.png');
});

it('displays the selected region of a reference image', () => {
  render(<AuthBanner src="/banner-principal.png" alt="Code Connect" crop={{ x: 40, y: 30, width: 247, height: 382, sourceWidth: 595, sourceHeight: 449 }} />);
  expect(screen.getByRole('img', { name: 'Code Connect' })).toHaveAttribute('viewBox', '40 30 247 382');
});

it.each(['login', 'registration'] as const)('renders the responsive %s illustration and local brand', (variant) => {
  render(<AuthBanner src={`/auth/${variant}.png`} variant={variant} alt="Code Connect" />);
  expect(screen.getByRole('img', { name: 'Code Connect' })).toHaveAttribute('src', `/auth/${variant}.png`);
});
