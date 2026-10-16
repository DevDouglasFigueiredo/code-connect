import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Tag } from './Tag';
it('displays a tag and exposes an accessible removal action', async () => {
  const remove = vi.fn();
  render(<Tag onRemove={remove}>React</Tag>);
  await userEvent.click(screen.getByRole('button', { name: 'Remover React' }));
  expect(remove).toHaveBeenCalledOnce();
});
