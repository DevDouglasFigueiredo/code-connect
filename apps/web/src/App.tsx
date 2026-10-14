import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/cadastro" element={<RegistrationPage />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>;
}
