import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'outline'; fullWidth?: boolean };

export function Button({ children, className = '', variant = 'solid', fullWidth = true, ...props }: ButtonProps) {
  return <button className={`flex min-h-[51px] ${fullWidth ? 'w-full' : 'w-auto'} items-center justify-center gap-2 rounded-lg px-4 py-3 text-lg font-semibold transition ${variant === 'outline' ? 'border border-accent text-accent hover:bg-accent/10' : 'bg-accent text-button-content hover:bg-accent/85'} disabled:cursor-wait disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}
