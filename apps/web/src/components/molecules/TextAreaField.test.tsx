import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { TextAreaField } from './TextAreaField';
it('associates its label and accepts multiline content', async () => {
  render(<TextAreaField label="Código" />);
  await userEvent.type(screen.getByLabelText('Código'), 'linha 1{enter}linha 2');
  expect(screen.getByLabelText('Código')).toHaveValue('linha 1\nlinha 2');
});
