import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../atoms/Icon';

export function CommunityNavigation({ signedIn, onLogout, onAbout }: { signedIn: boolean; onLogout: () => void; onAbout: () => void }) {
  const item = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded px-1 py-3 text-xs sm:text-base lg:flex-none lg:px-4 lg:py-2 lg:text-xl';
  const linkClass = ({ isActive }: { isActive: boolean }) => `${item} ${isActive ? 'text-navigation-active' : 'text-muted hover:text-content'}`;
  return <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-20 flex justify-around gap-1 bg-surface px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-12 sm:py-6 lg:static lg:flex-col lg:items-stretch lg:gap-10 lg:p-0">
    <NavLink to="/" end className={linkClass}><Icon name="feed" className="size-6 sm:size-8" />Feed</NavLink>
    <NavLink to="/perfil" className={linkClass}><Icon name="profile" className="size-6 sm:size-8" />Perfil</NavLink>
    <button type="button" onClick={onAbout} className={`${item} text-muted hover:text-content`}><Icon name="info" className="size-6 sm:size-8" />Sobre nós</button>
    {signedIn ? <button type="button" onClick={onLogout} className={`${item} text-muted hover:text-content`}><Icon name="logout" className="size-6 sm:size-8" />Sair</button> :
      <Link to="/login" className={`${item} text-muted hover:text-content`}><Icon name="login" className="size-6 sm:size-8" />Login</Link>}
  </nav>;
}
