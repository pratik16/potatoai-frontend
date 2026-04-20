import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full rounded-xl border border-surface-3 bg-surface-1 shadow-2xl', className ?? 'max-w-lg')}>
        {title && (
          <div className="flex items-center justify-between border-b border-surface-3 px-5 py-4">
            <h2 className="font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
