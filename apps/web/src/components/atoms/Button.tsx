import type { ButtonHTMLAttributes } from 'react';

export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`flex min-h-11 w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 text-sm font-semibold text-surface transition hover:bg-accent/85 disabled:cursor-wait disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}
