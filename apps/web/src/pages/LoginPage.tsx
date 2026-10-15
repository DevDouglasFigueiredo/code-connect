import { Link, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import { AuthBanner } from '../components/atoms/AuthBanner';
import { Icon } from '../components/atoms/Icon';
import { SocialLogin } from '../components/molecules/SocialLogin';
import { LoginForm, type LoginCredentials } from '../components/organisms/LoginForm';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { useAuth } from '../auth/auth-context';
import { errorMessage } from '../services/http';

type RegistrationNotice = { registered?: boolean; email?: string; rememberMe?: boolean };

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const state = location.state as RegistrationNotice | null;
  const [notice, setNotice] = useState(state?.registered ? 'Conta criada com sucesso. Faça seu login.' : '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  async function handleSubmit({ email, password, rememberMe }: LoginCredentials) {
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    setNotice('');
    try {
      await login({ email, password }, rememberMe);
    } catch (error: unknown) {
      setError(errorMessage(error));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }
  return (
    <AuthTemplate
      title="Login"
      description="Boas-vindas! Faça seu login."
      banner={<AuthBanner src="/auth/login.png" variant="login" alt="Desenvolvedora em um ambiente tecnológico iluminado em verde, com a marca Code Connect" />}
      footer={<div className="space-y-6">
        <SocialLogin onSelect={(provider) => setNotice(`O login com ${provider === 'github' ? 'GitHub' : 'Google'} estará disponível em breve.`)} />
        <div className="space-y-2 text-center text-sm"><p>Ainda não tem conta?</p><Link to="/cadastro" className="inline-flex items-center gap-3 text-lg text-accent hover:underline">Crie seu cadastro! <Icon name="registration" className="size-6" /></Link></div>
      </div>}
    >
      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialEmail={state?.email} initialRememberMe={state?.rememberMe} onForgotPassword={() => setNotice('A recuperação de senha estará disponível em breve.')} />
      {error && <p role="alert" className="mt-4 rounded border border-accent/30 p-3 text-sm">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded border border-accent/30 p-3 text-sm text-content">{notice}</p>}
    </AuthTemplate>
  );
}
