import { useId, type InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function FormField({ label, id, ...props }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-lg">{label}</label>
      <input id={inputId} className="min-h-[39px] w-full rounded bg-field px-4 py-2 text-sm text-surface placeholder:text-surface" {...props} />
    </div>
  );
}
