import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SocialLogin } from './SocialLogin';

it('identifies each social provider and reports the selected one', async () => {
  const onSelect = vi.fn();
  render(<SocialLogin onSelect={onSelect} />);
  expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Entrar com GitHub' }));
  expect(onSelect).toHaveBeenLastCalledWith('github');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
  expect(onSelect).toHaveBeenLastCalledWith('google');
});
