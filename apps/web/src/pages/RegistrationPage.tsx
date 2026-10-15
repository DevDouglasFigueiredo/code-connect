import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBanner } from '../components/atoms/AuthBanner';
import { Icon } from '../components/atoms/Icon';
import { SocialLogin } from '../components/molecules/SocialLogin';
import { RegistrationForm, type RegistrationCredentials } from '../components/organisms/RegistrationForm';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { register } from '../services/auth';
import { errorMessage } from '../services/http';

export function RegistrationPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  async function handleSubmit({ name, email, password, rememberMe }: RegistrationCredentials) {
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    setNotice('');
    try {
      const user = await register({ name, email, password });
      navigate('/login', { replace: true, state: { registered: true, email: user.email, rememberMe } });
    } catch (error: unknown) {
      setError(errorMessage(error));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }
  return <AuthTemplate variant="registration" title="Cadastro" description="Olá! Preencha seus dados."
    banner={<AuthBanner src="/auth/registration.png" variant="registration" alt="Desenvolvedora diante de um computador em um ambiente tecnológico verde, com a marca Code Connect" />}
    footer={<div className="space-y-6">
      <SocialLogin onSelect={(provider) => setNotice(`O login com ${provider === 'github' ? 'GitHub' : 'Google'} estará disponível em breve.`)} />
      <div className="flex flex-col gap-2 text-lg sm:flex-row sm:flex-wrap"><p>Já tem conta?</p><Link to="/login" className="inline-flex items-center gap-3 text-accent hover:underline">Faça seu login! <Icon name="login" className="size-6" /></Link></div>
    </div>}>
    <RegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    {error && <p role="alert" className="mt-4 rounded border border-accent/30 p-3 text-sm">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded border border-accent/30 p-3 text-sm">{notice}</p>}
  </AuthTemplate>;
}
