import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { PostForm } from './PostForm';
it('publishes normalized fields, optional code and tags', async () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  render(<PostForm onSubmit={submit} />);
  await userEvent.type(screen.getByLabelText('Nome do projeto'), ' React acessível ');
  await userEvent.type(screen.getByLabelText('Descrição'), ' Minha descrição ');
  await userEvent.type(screen.getByLabelText('Tags'), 'React{enter}');
  await userEvent.type(screen.getByLabelText('Tags'), 'CSS');
  await userEvent.type(screen.getByLabelText('Código (opcional)'), ' const hello = 1; ');
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(submit).toHaveBeenCalledWith({ title: 'React acessível', description: 'Minha descrição', tags: ['React', 'CSS'], code: ' const hello = 1; ', thumbnailUrl: null });
});
it('discards the draft and removable tags', async () => {
  render(<PostForm onSubmit={vi.fn()} />);
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Draft');
  await userEvent.type(screen.getByLabelText('Tags'), 'React{enter}');
  await userEvent.click(screen.getByRole('button', { name: 'Remover React' }));
  expect(screen.queryByRole('button', { name: 'Remover React' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
  expect(screen.getByLabelText('Nome do projeto')).toHaveValue('');
});
it('rejects unsupported image protocols before sending', async () => {
  const submit = vi.fn(); render(<PostForm onSubmit={submit} />);
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Title');
  await userEvent.type(screen.getByLabelText('Descrição'), 'Description');
  await userEvent.type(screen.getByLabelText('URL da imagem (opcional)'), 'ftp://example.com/photo.png');
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('HTTP ou HTTPS');
  expect(submit).not.toHaveBeenCalled();
});
