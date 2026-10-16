type IconName = 'github' | 'google' | 'arrow' | 'registration' | 'login' | 'feed' | 'profile' | 'info' | 'logout' | 'search' | 'like' | 'share' | 'comment' | 'close' | 'image' | 'publish' | 'trash';

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      {name === 'feed' && <path d="M5 2h10l5 5v15H5V2Zm9 2v5h4l-4-5ZM8 12v2h9v-2H8Zm0 4v2h9v-2H8Z" />}
      {name === 'profile' && <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 14a8 8 0 0 1-6-2.7c.7-2.2 2.5-3.3 6-3.3s5.3 1.1 6 3.3A8 8 0 0 1 12 20Z" />}
      {name === 'info' && <><circle cx="12" cy="12" r="10" /><path className="stroke-surface" fill="none" strokeWidth="2" d="M12 10v7m0-11v2" /></>}
      {name === 'logout' && <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M10 4H4v16h6m3-13 5 5-5 5m-6-5h12" />}
      {name === 'search' && <><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m15 15 6 6" stroke="currentColor" strokeWidth="2" /></>}
      {name === 'like' && <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m8 7-5 5 5 5m8-10 5 5-5 5" />}
      {name === 'share' && <><path d="m6 12 12-7M6 12l12 7" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="5" cy="12" r="3" /><circle cx="19" cy="4" r="3" /><circle cx="19" cy="20" r="3" /></>}
      {name === 'comment' && <path d="M3 3h18v15H8l-5 4V3Zm4 4v2h10V7H7Zm0 4v2h7v-2H7Z" />}
      {name === 'close' && <path d="m6 6 12 12M6 18 18 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      {name === 'image' && <><rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="2" /><path d="m3 18 5-5 4 4 4-7 5 8" fill="none" stroke="currentColor" strokeWidth="1.5" /></>}
      {name === 'publish' && <path d="M4 3h16v2H4V3Zm8 4-6 6h4v8h4v-8h4l-6-6Z" />}
      {name === 'trash' && <path d="M8 2h8l1 3h4v2H3V5h4l1-3Zm-3 7h14l-1 13H6L5 9Z" />}
      {name === 'github' && <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.08c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.54 0-1.22.43-2.22 1.15-3-.12-.28-.5-1.42.11-2.97 0 0 .94-.3 3.08 1.15a10.73 10.73 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.77 1.15 1.77 1.15 2.99 0 4.3-2.63 5.25-5.14 5.53.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />}
      {name === 'google' && <>
        <path className="fill-google-blue" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" />
        <path className="fill-google-green" d="M12 22c2.7 0 5-.9 6.8-2.5l-3.3-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.8v2.7A10.3 10.3 0 0 0 12 22Z" />
        <path className="fill-google-yellow" d="M6.2 13.6a6.2 6.2 0 0 1 0-3.2V7.7H2.8a10.1 10.1 0 0 0 0 8.6l3.4-2.7Z" />
        <path className="fill-google-red" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10.3 10.3 0 0 0-9.2 5.7l3.4 2.7A6.1 6.1 0 0 1 12 6.1Z" />
      </>}
      {name === 'login' && <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M14 4h6v16h-6M3 12h12m-5-5 5 5-5 5" />}
      {name === 'arrow' && <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m-6-6 6 6-6 6" />}
      {name === 'registration' && <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" d="M9 5H5v16h14V5h-4M9 3h6v4H9zM8 11h8M8 15h8M8 18h5" />}
    </svg>
  );
}
