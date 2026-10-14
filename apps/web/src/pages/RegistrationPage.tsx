import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthBanner } from '../components/atoms/AuthBanner';
import { Icon } from '../components/atoms/Icon';
import { SocialLogin } from '../components/molecules/SocialLogin';
import { RegistrationForm } from '../components/organisms/RegistrationForm';
import { AuthTemplate } from '../components/templates/AuthTemplate';

export function RegistrationPage() {
  const [notice, setNotice] = useState('');
  return <AuthTemplate variant="registration" title="Cadastro" description="Olá! Preencha seus dados."
    banner={<AuthBanner src="/auth/registration.png" variant="registration" alt="Desenvolvedora diante de um computador em um ambiente tecnológico verde, com a marca Code Connect" />}
    footer={<div className="space-y-6">
      <SocialLogin onSelect={(provider) => setNotice(`O login com ${provider === 'github' ? 'GitHub' : 'Google'} estará disponível em breve.`)} />
      <div className="flex flex-col gap-2 text-lg sm:flex-row sm:flex-wrap"><p>Já tem conta?</p><Link to="/login" className="inline-flex items-center gap-3 text-accent hover:underline">Faça seu login! <Icon name="login" className="size-6" /></Link></div>
    </div>}>
    <RegistrationForm onSubmit={() => setNotice('O cadastro ainda não está conectado. Em breve você poderá criar sua conta.')} />
    {notice && <p role="status" className="mt-4 rounded border border-accent/30 p-3 text-sm">{notice}</p>}
  </AuthTemplate>;
}
