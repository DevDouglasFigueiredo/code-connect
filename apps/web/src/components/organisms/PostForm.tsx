import { useRef, useState, type FormEvent } from 'react';
import { type PostInput, postError } from '../../services/posts';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Thumbnail } from '../atoms/Thumbnail';
import { Tag } from '../atoms/Tag';
import { FormField } from '../molecules/FormField';
import { TextAreaField } from '../molecules/TextAreaField';
import { Feedback } from '../molecules/Feedback';

export function PostForm({ onSubmit }: { onSubmit: (input: PostInput) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  function nextTags(): string[] {
    const value = tag.trim();
    const result = value && !tags.some((item) => item.toLocaleLowerCase() === value.toLocaleLowerCase()) ? [...tags, value] : tags;
    if (result.length > 10 || result.some((item) => item.length > 30)) throw new Error('Use até 10 tags com no máximo 30 caracteres cada.');
    return result;
  }
  function addTag() {
    try { setTags(nextTags()); setTag(''); setError(''); }
    catch (reason) { setError((reason as Error).message); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    let selectedTags: string[];
    try { selectedTags = nextTags(); } catch (reason) { setError((reason as Error).message); return; }
    if (!title.trim() || !description.trim()) { setError('Preencha o nome e a descrição do projeto.'); return; }
    if (url.trim()) {
      try {
        const parsed = new URL(url.trim());
        if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
      } catch { setError('Informe uma URL de imagem HTTP ou HTTPS válida.'); return; }
    }
    submitting.current = true; setPending(true); setError('');
    try { await onSubmit({ title: title.trim(), description: description.trim(), code: code || null, thumbnailUrl: url.trim() || null, tags: selectedTags }); }
    catch (reason: unknown) { setError(postError(reason)); }
    finally { submitting.current = false; setPending(false); }
  }
  function reset() { setTitle(''); setDescription(''); setCode(''); setUrl(''); setTags([]); setTag(''); setError(''); }
  return <form onSubmit={(event) => void submit(event)} onReset={reset} className="grid min-w-0 gap-6 rounded-lg bg-surface p-4 sm:p-8 xl:grid-cols-2">
    <div className="min-w-0 space-y-4">
      <Thumbnail src={url.trim() || null} title={title || 'novo projeto'} large />
      <FormField label="URL da imagem (opcional)" type="url" maxLength={2048} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://exemplo.com/projeto.png" disabled={pending} />
      <p className="text-sm text-muted">Sem imagem? Seu projeto terá uma prévia padrão.</p>
    </div>
    <div className="min-w-0 space-y-6">
      <h1 className="text-2xl font-semibold">Novo projeto</h1>
      <FormField label="Nome do projeto" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required pattern=".*\S.*" disabled={pending} />
      <TextAreaField label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} required rows={6} disabled={pending} />
      <div className="space-y-3">
        <FormField label="Tags" value={tag} onChange={(event) => setTag(event.target.value)} maxLength={30} disabled={pending} placeholder="Digite uma tag e pressione Enter" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} />
        <button type="button" onClick={addTag} disabled={pending || !tag.trim()} className="rounded text-sm text-accent underline disabled:opacity-40">Adicionar tag</button>
        <div className="flex flex-wrap gap-2">{tags.map((value) => <Tag key={value} onRemove={pending ? undefined : () => setTags((items) => items.filter((item) => item !== value))}>{value}</Tag>)}</div>
      </div>
      <TextAreaField label="Código (opcional)" value={code} onChange={(event) => setCode(event.target.value)} maxLength={50000} rows={6} spellCheck={false} disabled={pending} />
      {error && <Feedback message={error} error />}
      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
        <Button type="reset" variant="outline" disabled={pending}>Descartar <Icon name="trash" /></Button>
        <Button type="submit" disabled={pending}>{pending ? 'Publicando…' : 'Publicar'}<Icon name="publish" /></Button>
      </div>
    </div>
  </form>;
}
