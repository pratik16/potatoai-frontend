import { useId, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open:          boolean;
  title:         string;
  message:       React.ReactNode;
  confirmLabel:  string;
  cancelLabel?:  string;
  /** Styles the confirm button as destructive. */
  destructive?:  boolean;
  onConfirm:     () => void;
  onCancel:      () => void;
}

/**
 * In-app replacement for window.confirm: an alertdialog with focus starting on
 * Cancel, so Enter or Escape straight after opening never destroys anything.
 */
export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel = 'Cancel', destructive, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const bodyId    = useId();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      role="alertdialog"
      describedBy={bodyId}
      initialFocusRef={cancelRef}
      className="max-w-md"
    >
      <p id={bodyId} className="text-sm text-gray-300">{message}</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" ref={cancelRef} variant="secondary" onClick={onCancel} className="min-h-11 sm:min-h-0">
          {cancelLabel}
        </Button>
        <Button type="button" variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} className="min-h-11 sm:min-h-0">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
