import { Button } from '../components/atoms/Button';
import { useAuth } from '../auth/auth-context';

export function ProfilePage() {
  const { user, loading, error, retry, logout } = useAuth();
  return <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-6">
    <h1 className="text-3xl font-semibold text-accent">Meu perfil</h1>
    {loading && <p role="status">Carregando perfil…</p>}
    {error && <><p role="alert">{error}</p><Button onClick={retry}>Tentar novamente</Button></>}
    {user && <dl className="space-y-2 rounded-lg bg-surface p-6"><dt className="text-muted">Nome</dt><dd>{user.name}</dd><dt className="text-muted">Email</dt><dd>{user.email}</dd></dl>}
    <Button onClick={logout}>Sair</Button>
  </main>;
}
