import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { CommentForm } from './CommentForm';
it('trims and sends a comment, then clears the field', async () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  render(<CommentForm onSubmit={submit} />);
  expect(screen.getByRole('button', { name: 'Enviar comentário' })).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox'), ' Olá! ');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar comentário' }));
  expect(submit).toHaveBeenCalledWith('Olá!');
  expect(screen.getByRole('textbox')).toHaveValue('');
});
it('preserves the draft when sending fails', async () => {
  render(<CommentForm onSubmit={vi.fn().mockRejectedValue(new Error('offline'))} />);
  await userEvent.type(screen.getByRole('textbox'), 'Meu comentário');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar comentário' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('Meu comentário');
});
