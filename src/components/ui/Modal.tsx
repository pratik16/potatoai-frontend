import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  className?: string;
  /** Use `alertdialog` for a confirmation that interrupts the user. */
  role?:     'dialog' | 'alertdialog';
  /** Element focused on open; defaults to the first focusable element in the dialog. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** id of the element that describes the dialog (read after the title). */
  describedBy?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog: labelled by its title, traps Tab inside, closes on Escape or a
 * backdrop click, and gives focus back to whatever opened it. Portalled to <body>:
 * an opener inside a transformed ancestor (the virtualised chat rows) would
 * otherwise turn `fixed` into "fixed to that row".
 */
export function Modal({ open, onClose, title, children, className, role = 'dialog', initialFocusRef, describedBy }: ModalProps) {
  const titleId  = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running the focus effect when the parent re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel  = panelRef.current;
    (initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0];
      const last  = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      // The opener may have been unmounted meanwhile (e.g. the row it lived in).
      if (opener?.isConnected) opener.focus();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={clsx('relative w-full rounded-xl border border-surface-3 bg-surface-1 shadow-2xl focus:outline-none', className ?? 'max-w-lg')}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-surface-3 px-5 py-4">
            <h2 id={titleId} className="font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
