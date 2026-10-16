import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Thumbnail } from './Thumbnail';
it('uses a placeholder for missing or unsafe URLs', () => {
  const { rerender } = render(<Thumbnail src={null} title="Projeto" />);
  expect(screen.getByRole('img', { name: 'Sem imagem para Projeto' })).toBeInTheDocument();
  rerender(<Thumbnail src="javascript:alert(1)" title="Projeto" />);
  expect(screen.getByText('Projeto sem imagem')).toBeInTheDocument();
});
it('handles a broken image and tries again when the URL changes', () => {
  const { rerender } = render(<Thumbnail src="https://example.com/old.png" title="Projeto" />);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img', { name: 'Sem imagem para Projeto' })).toBeInTheDocument();
  rerender(<Thumbnail src="https://example.com/new.png" title="Projeto" large />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/new.png');
});
