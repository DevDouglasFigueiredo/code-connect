import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';
it('submits text and removes terms or clears all', async () => {
  const search = vi.fn();
  render(<SearchBar query="React CSS" onSearch={search} />);
  await userEvent.click(screen.getByRole('button', { name: 'Remover CSS' }));
  expect(search).toHaveBeenLastCalledWith('React');
  await userEvent.clear(screen.getByRole('searchbox'));
  await userEvent.type(screen.getByRole('searchbox'), 'NestJS{enter}');
  expect(search).toHaveBeenLastCalledWith('NestJS');
  await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }));
  expect(search).toHaveBeenLastCalledWith('');
});
