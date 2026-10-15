import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { FormField } from '../molecules/FormField';

export type LoginCredentials = { email: string; password: string; rememberMe: boolean };

export function LoginForm({ onSubmit, onForgotPassword, isSubmitting = false, initialEmail = '', initialRememberMe = true }: {
  onSubmit: (credentials: LoginCredentials) => void;
  onForgotPassword: () => void;
  isSubmitting?: boolean;
  initialEmail?: string;
  initialRememberMe?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(initialRememberMe);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSubmitting) onSubmit({ email: email.trim().toLowerCase(), password, rememberMe });
  }

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit} className="space-y-4" aria-label="Login">
      <FormField label="Email" name="email" type="email" placeholder="Digite seu email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <div className="space-y-2">
        <FormField label="Senha" name="password" type="password" placeholder="******" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-muted"><input type="checkbox" name="rememberMe" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-6 accent-accent" />Lembrar-me</label>
          <button type="button" onClick={onForgotPassword} className="underline underline-offset-2 hover:text-accent">Esqueci a senha</button>
        </div>
      </div>
      <div className="pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando…' : 'Login'} <Icon name="arrow" className="size-6" /></Button></div>
    </form>
  );
}
