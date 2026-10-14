import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Icon } from './Icon';

it.each(['github', 'google', 'arrow', 'registration', 'login'] as const)('renders the decorative %s icon without an extra accessible name', (name) => {
  const { container } = render(<Icon name={name} />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('path')).toBeInTheDocument();
});
