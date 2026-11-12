import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-surface-muted',
  ghost: 'text-muted hover:bg-surface-muted hover:text-text',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconDefinition;
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon && <Icon icon={icon} />}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  active?: boolean;
}

export function IconButton({ icon, label, active, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-control transition-colors ${
        active ? 'bg-surface text-text shadow-card' : 'text-muted hover:bg-surface-muted hover:text-text'
      } ${className}`}
      {...rest}
    >
      <Icon icon={icon} />
    </button>
  );
}
