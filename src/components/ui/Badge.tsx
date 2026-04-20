import { clsx } from 'clsx';

interface BadgeProps {
  children:   React.ReactNode;
  color?:     string;
  className?: string;
  style?:     React.CSSProperties;
}

export function Badge({ children, color, className, style }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={style ?? (color ? { backgroundColor: color + '22', color } : undefined)}
    >
      {children}
    </span>
  );
}
