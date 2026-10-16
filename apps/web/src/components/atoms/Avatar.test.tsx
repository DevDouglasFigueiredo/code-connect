import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Avatar } from './Avatar';
it('derives initials without requiring an avatar URL', () => {
  render(<Avatar name=" Ana Silva " />);
  expect(screen.getByText('AS')).toHaveAttribute('aria-hidden', 'true');
});
