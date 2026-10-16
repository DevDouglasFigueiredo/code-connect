import { useId, type TextareaHTMLAttributes } from 'react';

export function TextAreaField({ label, id, light = false, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; light?: boolean }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return <div className="flex min-w-0 flex-col gap-2"><label htmlFor={fieldId} className="text-lg">{label}</label>
    <textarea {...props} id={fieldId} className={`min-h-28 w-full resize-y rounded px-4 py-2 text-sm text-surface placeholder:text-surface/80 ${light ? 'bg-content' : 'bg-field'}`} />
  </div>;
}
