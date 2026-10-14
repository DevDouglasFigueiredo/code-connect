import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthBanner } from '../components/atoms/AuthBanner';
import { Icon } from '../components/atoms/Icon';
import { SocialLogin } from '../components/molecules/SocialLogin';
import { LoginForm } from '../components/organisms/LoginForm';
import { AuthTemplate } from '../components/templates/AuthTemplate';

export function LoginPage() {
  const [notice, setNotice] = useState('');
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
      <LoginForm onSubmit={() => setNotice('A autenticação ainda não está conectada. Em breve você poderá acessar sua conta.')} onForgotPassword={() => setNotice('A recuperação de senha estará disponível em breve.')} />
      {notice && <p role="status" className="mt-4 rounded border border-accent/30 p-3 text-sm text-content">{notice}</p>}
    </AuthTemplate>
  );
}
