import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AuthorBadge } from './AuthorBadge';
it('identifies the author without inventing a username', () => {
  render(<AuthorBadge name="Ana Silva" />);
  expect(screen.getByText('Ana Silva')).toBeInTheDocument();
  expect(screen.getByText('AS')).toBeInTheDocument();
});
