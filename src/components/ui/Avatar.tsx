import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { normalizeAvatarUrl } from '../../utils/avatarUrl';

interface AvatarProps {
  src?:  string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const displaySrc = src ? normalizeAvatarUrl(src) : null;

  useEffect(() => {
    setFailed(false);
  }, [displaySrc]);

  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const sizeClass = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }[size];

  if (displaySrc && !failed) {
    return (
      <img
        src={displaySrc}
        alt={name ?? ''}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={clsx('rounded-full object-cover', sizeClass)}
      />
    );
  }

  return (
    <div className={clsx('flex items-center justify-center rounded-full bg-potato-600 font-semibold text-white', sizeClass)}>
      {initials}
    </div>
  );
}
