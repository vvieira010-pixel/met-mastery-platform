import { useEffect, useRef } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

/**
 * Reusable confirmation modal for destructive actions
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   confirmVariant?: 'danger' | 'primary' | 'ghost',
 *   loading?: boolean,
 * }} props
 */
export function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  confirmVariant = 'danger',
  loading = false 
}) {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
    }
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={420}
    >
      <p style={{ margin: '0 0 20px', color: 'var(--text-2)', lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant={confirmVariant} 
          onClick={onConfirm} 
          disabled={loading}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Bulk action confirmation modal
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: (action: string) => void,
 *   selectedCount: number,
 *   itemLabel: string, // e.g. "submissions"
 *   actions: Array<{ id: string, label: string, variant: 'danger' | 'primary' | 'ghost', icon?: React.ReactNode }>
 *   loading?: boolean,
 * }} props
 */
export function BulkActionModal({ 
  open, 
  onClose, 
  onConfirm, 
  selectedCount, 
  itemLabel, 
  actions, 
  loading = false 
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Actions"
      maxWidth={420}
    >
      <p style={{ margin: '0 0 16px', color: 'var(--text-2)', lineHeight: 1.6 }}>
        Apply an action to <strong>{selectedCount}</strong> {itemLabel}{selectedCount !== 1 ? 's' : ''}:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map(action => (
          <Button
            key={action.id}
            variant={action.variant}
            onClick={() => { onConfirm(action.id); onClose(); }}
            disabled={loading}
            loading={loading}
            style={{ justifyContent: 'flex-start', gap: 10 }}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;