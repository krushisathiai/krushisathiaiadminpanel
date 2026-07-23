import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 2000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-hd" style={{ marginBottom: 16 }}>
          <h3 style={{ color: type === 'danger' ? 'var(--red)' : 'var(--primary)' }}>
            <AlertTriangle size={20} />
            {title}
          </h3>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-ft" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={`btn btn-sm ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
