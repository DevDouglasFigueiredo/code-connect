import type { ReactNode } from 'react';

type AuthTemplateProps = { banner: ReactNode; title: string; description: string; children: ReactNode; footer?: ReactNode };

export function AuthTemplate({ banner, title, description, children, footer }: AuthTemplateProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-8">
      <section aria-labelledby="auth-title" className="grid w-full max-w-[796px] gap-8 rounded-3xl bg-surface p-6 sm:p-10 md:grid-cols-[1.28fr_1fr] md:gap-14 md:px-[54px] md:py-11">
        <div className="hidden aspect-[247/382] overflow-hidden md:block">{banner}</div>
        <div className="flex min-w-0 flex-col justify-center">
          <header className="mb-9"><h1 id="auth-title" className="text-2xl font-semibold">{title}</h1><p className="mt-6 text-base">{description}</p></header>
          {children}
          {footer && <footer className="mt-7">{footer}</footer>}
        </div>
      </section>
    </main>
  );
}
