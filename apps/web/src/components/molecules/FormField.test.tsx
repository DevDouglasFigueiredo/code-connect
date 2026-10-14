import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { FormField } from './FormField';

it('associates its label and accepts user input', async () => {
  render(<FormField label="Email" autoComplete="email" />);
  const input = screen.getByRole('textbox', { name: 'Email' });
  await userEvent.type(input, 'dev@example.com');
  expect(input).toHaveValue('dev@example.com');
  expect(input).toHaveAttribute('autocomplete', 'email');
});
