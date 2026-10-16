import { useRef, useState, type FormEvent } from 'react';
import { postError } from '../../services/posts';
import { Button } from '../atoms/Button';
import { TextAreaField } from './TextAreaField';
import { Feedback } from './Feedback';

export function CommentForm({ label = 'Escreva um comentário', onSubmit, onCancel }: { label?: string; onSubmit: (text: string) => Promise<void>; onCancel?: () => void }) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || !text.trim()) return;
    submitting.current = true; setPending(true); setError('');
    try { await onSubmit(text.trim()); setText(''); }
    catch (reason: unknown) { setError(postError(reason)); }
    finally { submitting.current = false; setPending(false); }
  }
  return <form onSubmit={(event) => void submit(event)} className="space-y-3">
    <TextAreaField light label={label} value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} required disabled={pending} rows={3} />
    {error && <Feedback message={error} error />}
    <div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={pending || !text.trim()} fullWidth={false}>{pending ? 'Enviando…' : 'Enviar comentário'}</Button>
      {onCancel && <button type="button" disabled={pending} onClick={onCancel} className="rounded text-sm underline">Cancelar</button>}
    </div>
  </form>;
}
