import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-potato-600 text-white hover:bg-potato-700':                     variant === 'primary',
          'bg-surface-3 text-white hover:bg-surface-4':                       variant === 'secondary',
          'text-gray-400 hover:text-white hover:bg-surface-2':                variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700':                           variant === 'danger',
          'h-7 px-3 text-xs':                                                 size === 'sm',
          'h-9 px-4 text-sm':                                                 size === 'md',
          'h-11 px-6 text-base':                                              size === 'lg',
        },
        className,
      )}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : children}
    </button>
  );
}
