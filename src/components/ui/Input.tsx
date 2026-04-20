import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{leftIcon}</span>
        )}
        <input
          id={id}
          {...props}
          className={clsx(
            'w-full rounded-lg border border-surface-3 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-potato-500 focus:outline-none',
            leftIcon && 'pl-10',
            error && 'border-red-500',
            className,
          )}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
