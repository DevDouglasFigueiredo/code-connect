import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context';
import { Logo } from '../atoms/Logo';
import { CommunityNavigation } from '../organisms/CommunityNavigation';
import { Feedback } from '../molecules/Feedback';

export function CommunityTemplate({ children }: { children: ReactNode }) {
  const { hasSession, logout } = useAuth();
  const navigate = useNavigate();
  const [about, setAbout] = useState(false);
  return <div className="mx-auto flex min-h-screen w-full max-w-[1248px] flex-col gap-12 px-4 pb-36 pt-14 sm:gap-16 sm:px-6 sm:pt-10 sm:pb-44 lg:flex-row lg:items-stretch lg:gap-7 lg:py-14">
    <a href="#conteudo" className="sr-only rounded bg-accent p-3 text-button-content focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">Pular para o conteúdo</a>
    <header className="flex shrink-0 flex-col items-center gap-10 sm:flex-row sm:justify-between lg:w-[177px] lg:flex-col lg:justify-start lg:gap-20 lg:rounded-lg lg:bg-surface lg:px-4 lg:py-10">
      <Link to="/" aria-label="Code Connect — início"><Logo /></Link>
      <div className="flex flex-col items-center gap-10 lg:w-full">
        <Link to="/publicar" className="rounded-lg border border-accent px-7 py-3 text-xl text-accent hover:bg-accent/10 lg:w-full lg:px-4 lg:text-center">Publicar</Link>
        <CommunityNavigation signedIn={hasSession} onAbout={() => setAbout((value) => !value)} onLogout={() => { logout(); navigate('/'); }} />
      </div>
    </header>
    <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 space-y-6 outline-none">
      {about && <Feedback message="A página Sobre nós estará disponível em breve." />}
      {children}
    </main>
  </div>;
}
