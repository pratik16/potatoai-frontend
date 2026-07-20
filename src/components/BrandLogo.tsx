import { clsx } from 'clsx';

type Size = 'sm' | 'md' | 'lg';

const markSize: Record<Size, string> = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-8 w-8',
};

const wordSize: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/** App mark from public/icon-192.png (derived from android store launcher). */
export function BrandMark({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      aria-hidden
      className={clsx('shrink-0 rounded-md object-contain', markSize[size], className)}
    />
  );
}

/** Mark + “PotatoChat” wordmark for headers / auth screens. */
export function BrandLogo({
  size = 'md',
  className,
  wordmarkClassName,
}: {
  size?: Size;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <BrandMark size={size} />
      <span className={clsx('font-semibold text-white', wordSize[size], wordmarkClassName)}>
        PotatoChat
      </span>
    </span>
  );
}
