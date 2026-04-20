import { clsx } from 'clsx';

interface AvatarProps {
  src?:  string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const sizeClass = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }[size];

  if (src) {
    return <img src={src} alt={name ?? ''} className={clsx('rounded-full object-cover', sizeClass)} />;
  }

  return (
    <div className={clsx('flex items-center justify-center rounded-full bg-potato-600 font-semibold text-white', sizeClass)}>
      {initials}
    </div>
  );
}
