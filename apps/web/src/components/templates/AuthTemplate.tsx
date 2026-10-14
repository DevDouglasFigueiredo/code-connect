import type { ReactNode } from 'react';

type AuthTemplateProps = { banner: ReactNode; title: string; description: string; children: ReactNode; footer?: ReactNode; variant?: 'login' | 'registration' };

export function AuthTemplate({ banner, title, description, children, footer, variant = 'login' }: AuthTemplateProps) {
  return (
    <main className={`relative isolate flex min-h-dvh items-start justify-center overflow-hidden px-4 py-14 sm:px-[60px] sm:py-20 lg:px-3 lg:pb-[194px] ${variant === 'registration' ? 'lg:pt-[min(14.923vh,194px)]' : 'lg:pt-[min(16.462vh,214px)]'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {[false, true].map((bottom) => <div key={String(bottom)} className={`absolute aspect-[407/486] w-[76px] opacity-30 sm:w-[285px] lg:w-[407px] ${bottom ? 'right-0 bottom-0 lg:right-[7.4%]' : 'left-0 top-0 lg:left-[7.4%]'}`}>
          <img src="/auth/Group.svg" alt="" className="absolute bottom-0 left-0 h-[74.15%] w-[55.91%]" />
          <img src="/auth/Group1.svg" alt="" className="absolute right-0 top-0 h-[74.15%] w-[55.91%]" />
        </div>)}
      </div>
      <section aria-labelledby="auth-title" data-variant={variant} className="grid w-full max-w-[328px] gap-8 rounded-2xl ring-1 ring-inset ring-page bg-surface px-4 py-8 sm:max-w-[648px] sm:rounded-[32px] sm:px-[60px] sm:py-14 lg:max-w-[996px] lg:grid-cols-[407px_410px] lg:gap-[23px] lg:px-[78px]">
        <div className="w-full sm:mx-auto sm:max-w-[480px] lg:w-[407px]">{banner}</div>
        <div className="min-w-0 sm:mx-auto sm:w-full sm:max-w-[479px] lg:max-w-none lg:px-8">
          <div className={variant === 'login' ? 'lg:px-[14px]' : undefined}>
            <header className="mb-8"><h1 id="auth-title" className="text-2xl font-semibold leading-normal lg:text-3xl">{title}</h1><p className="mt-6 text-xl leading-normal">{description}</p></header>
            {children}
          </div>
          {footer && <footer className="mt-8">{footer}</footer>}
        </div>
      </section>
    </main>
  );
}
