import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { CommunityTemplate } from './components/templates/CommunityTemplate';
import { FeedPage } from './pages/FeedPage';
import { PostDetailsPage } from './pages/PostDetailsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { returnTo } from './auth/return-to';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/auth-context';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';

function AuthRoutes() {
  const { hasSession } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.search, location.hash]);
  return <Routes>
    <Route path="/login" element={hasSession ? <Navigate to={returnTo(location.state)} replace /> : <LoginPage />} />
    <Route path="/cadastro" element={hasSession ? <Navigate to={returnTo(location.state)} replace /> : <RegistrationPage />} />
    <Route path="/perfil" element={hasSession ? <ProfilePage /> : <Navigate to="/login" state={{ from: '/perfil' }} replace />} />
    <Route element={<CommunityTemplate><Outlet /></CommunityTemplate>}>
      <Route path="/" element={<FeedPage />} />
      <Route path="/posts/:id" element={<PostDetailsPage />} />
      <Route path="/publicar" element={hasSession ? <CreatePostPage /> : <Navigate to="/login" state={{ from: '/publicar' }} replace />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><AuthRoutes /></AuthProvider>;
}
