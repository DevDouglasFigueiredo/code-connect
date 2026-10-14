import { useId, type InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function FormField({ label, id, ...props }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm">{label}</label>
      <input id={inputId} className="min-h-10 w-full rounded-sm bg-field px-3 text-sm text-surface placeholder:text-surface/70" {...props} />
    </div>
  );
}
