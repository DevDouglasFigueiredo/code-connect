import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button } from './Button';

it('renders an accessible button and handles clicks', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Continuar</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(onClick).toHaveBeenCalledOnce();
});

it('respects the disabled state', async () => {
  const onClick = vi.fn();
  render(<Button disabled onClick={onClick}>Continuar</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(onClick).not.toHaveBeenCalled();
});
