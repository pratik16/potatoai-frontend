import { clsx } from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-surface-3 border-t-potato-500',
        className ?? 'h-5 w-5',
      )}
    />
  );
}
