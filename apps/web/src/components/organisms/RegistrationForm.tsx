import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { FormField } from '../molecules/FormField';

export type RegistrationCredentials = { name: string; email: string; password: string; rememberMe: boolean };

export function RegistrationForm({ onSubmit, isSubmitting = false }: { onSubmit: (credentials: RegistrationCredentials) => void; isSubmitting?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSubmitting) onSubmit({ name: name.trim(), email: email.trim().toLowerCase(), password, rememberMe });
  }

  return <form aria-busy={isSubmitting} aria-label="Cadastro" onSubmit={handleSubmit} className="space-y-4">
    <FormField label="Nome" name="name" placeholder="Nome completo" autoComplete="name" required pattern=".*\S.*" title="Informe seu nome" value={name} onChange={(event) => setName(event.target.value)} />
    <FormField label="Email" name="email" type="email" placeholder="Digite seu email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
    <div className="space-y-2">
      <FormField label="Senha" name="password" type="password" placeholder="******" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted"><input type="checkbox" name="rememberMe" className="size-6 accent-accent" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />Lembrar-me</label>
    </div>
    <div className="pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Cadastrando…' : 'Cadastrar'} <Icon name="arrow" className="size-6" /></Button></div>
  </form>;
}
