import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { FormField } from '../molecules/FormField';

export type LoginCredentials = { identifier: string; password: string; rememberMe: boolean };

export function LoginForm({ onSubmit, onForgotPassword }: {
  onSubmit: (credentials: LoginCredentials) => void;
  onForgotPassword: () => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ identifier: identifier.trim(), password, rememberMe });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login">
      <FormField label="Email ou usuário" name="identifier" autoComplete="username" required pattern=".*\S.*" title="Informe seu email ou usuário" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
      <div className="space-y-2">
        <FormField label="Senha" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5 text-muted"><input type="checkbox" name="rememberMe" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4 accent-accent" />Lembrar-me</label>
          <button type="button" onClick={onForgotPassword} className="underline underline-offset-2 hover:text-accent">Esqueci a senha</button>
        </div>
      </div>
      <div className="pt-3"><Button type="submit">Login <Icon name="arrow" className="size-4" /></Button></div>
    </form>
  );
}
