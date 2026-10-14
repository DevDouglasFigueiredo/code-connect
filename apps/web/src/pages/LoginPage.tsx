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
      banner={<AuthBanner src="/banner-principal.png" alt="Desenvolvedora em um ambiente tecnológico iluminado em verde, com a marca Code Connect" crop={{ x: 40, y: 30, width: 247, height: 382, sourceWidth: 595, sourceHeight: 449 }} />}
      footer={<div className="space-y-6">
        <SocialLogin onSelect={(provider) => setNotice(`O login com ${provider === 'github' ? 'GitHub' : 'Google'} estará disponível em breve.`)} />
        <div className="space-y-3 text-center text-sm"><p>Ainda não tem conta?</p><button type="button" className="inline-flex items-center gap-2 text-accent hover:underline" onClick={() => setNotice('O cadastro estará disponível em breve.')}>Crie seu cadastro! <Icon name="registration" className="size-4" /></button></div>
      </div>}
    >
      <LoginForm onSubmit={() => setNotice('A autenticação ainda não está conectada. Em breve você poderá acessar sua conta.')} onForgotPassword={() => setNotice('A recuperação de senha estará disponível em breve.')} />
      {notice && <p role="status" className="mt-4 rounded border border-accent/30 p-3 text-sm text-content">{notice}</p>}
    </AuthTemplate>
  );
}
