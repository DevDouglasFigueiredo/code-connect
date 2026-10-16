import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Feedback } from './Feedback';
it('announces errors and offers retry', async () => {
  const retry = vi.fn();
  render(<Feedback message="Falha na conexão" error onRetry={retry} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Falha na conexão');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(retry).toHaveBeenCalledOnce();
});
