import { useEffect } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { clearToast } from '../../app/uiSlice';

interface ToastProps {
  message: string;
  type:    'success' | 'error' | 'info';
}

const ICONS = { success: CheckCircle, error: XCircle, info: Info };

export function Toast({ message, type }: ToastProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const t = setTimeout(() => dispatch(clearToast()), 4000);
    return () => clearTimeout(t);
  }, [message, dispatch]);

  const Icon = ICONS[type];

  return (
    <div
      className={clsx(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl',
        type === 'success' && 'border-green-700 bg-green-900/80 text-green-200',
        type === 'error'   && 'border-red-700 bg-red-900/80 text-red-200',
        type === 'info'    && 'border-surface-3 bg-surface-1 text-white',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
      <button onClick={() => dispatch(clearToast())} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
