import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/auth-context';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';

function AuthRoutes() {
  const { hasSession } = useAuth();
  return <Routes>
    <Route path="/login" element={hasSession ? <Navigate to="/perfil" replace /> : <LoginPage />} />
    <Route path="/cadastro" element={hasSession ? <Navigate to="/perfil" replace /> : <RegistrationPage />} />
    <Route path="/perfil" element={hasSession ? <ProfilePage /> : <Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to={hasSession ? '/perfil' : '/login'} replace />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><AuthRoutes /></AuthProvider>;
}
