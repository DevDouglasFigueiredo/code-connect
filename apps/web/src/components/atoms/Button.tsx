import type { ButtonHTMLAttributes } from 'react';

export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`flex min-h-[51px] w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-lg font-semibold text-button-content transition hover:bg-accent/85 disabled:cursor-wait disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}
