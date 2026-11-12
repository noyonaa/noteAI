import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text. Use `hideLabel` for compact inputs; it stays available to screen readers. */
  label: string;
  hideLabel?: boolean;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={hideLabel ? 'sr-only' : 'text-[13px] font-semibold text-text'}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-10 rounded-control border bg-surface px-3 text-sm text-text transition-colors ${
          error ? 'border-danger' : 'border-border-strong hover:border-accent'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
