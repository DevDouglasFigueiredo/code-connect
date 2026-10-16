import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';
it('navigates pages and prevents moving before the first page', async () => {
  const page = vi.fn();
  render(<Pagination meta={{ page: 1, limit: 6, total: 20, totalPages: 4 }} onPage={page} />);
  expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
  expect(page).toHaveBeenCalledWith(2);
});
