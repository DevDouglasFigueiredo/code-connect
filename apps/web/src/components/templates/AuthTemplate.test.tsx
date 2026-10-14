import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AuthTemplate } from './AuthTemplate';

it('composes a different authentication screen from the supplied content', () => {
  render(<AuthTemplate title="Cadastro" description="Crie sua conta" banner={<img src="/cadastro.png" alt="Cadastro" />} footer={<p>Já tem conta?</p>}><label>Nome<input /></label></AuthTemplate>);
  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Cadastro' })).toHaveAttribute('src', '/cadastro.png');
  expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  expect(screen.getByText('Já tem conta?')).toBeInTheDocument();
});
