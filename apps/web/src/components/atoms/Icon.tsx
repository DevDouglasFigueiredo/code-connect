type IconName = 'github' | 'google' | 'arrow' | 'registration';

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      {name === 'github' && <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.08c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.54 0-1.22.43-2.22 1.15-3-.12-.28-.5-1.42.11-2.97 0 0 .94-.3 3.08 1.15a10.73 10.73 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.77 1.15 1.77 1.15 2.99 0 4.3-2.63 5.25-5.14 5.53.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />}
      {name === 'google' && <>
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.8-2.5l-3.3-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.8v2.7A10.3 10.3 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.2 13.6a6.2 6.2 0 0 1 0-3.2V7.7H2.8a10.1 10.1 0 0 0 0 8.6l3.4-2.7Z" />
        <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10.3 10.3 0 0 0-9.2 5.7l3.4 2.7A6.1 6.1 0 0 1 12 6.1Z" />
      </>}
      {name === 'arrow' && <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m-6-6 6 6-6 6" />}
      {name === 'registration' && <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" d="M9 5H5v16h14V5h-4M9 3h6v4H9zM8 11h8M8 15h8M8 18h5" />}
    </svg>
  );
}
