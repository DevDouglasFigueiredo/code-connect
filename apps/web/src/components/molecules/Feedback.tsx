export function Feedback({ message, error = false, onRetry }: { message: string; error?: boolean; onRetry?: () => void }) {
  return <div role={error ? 'alert' : 'status'} className="rounded-lg border border-current/25 p-4 text-sm">
    <p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 underline underline-offset-4">Tentar novamente</button>}
  </div>;
}
