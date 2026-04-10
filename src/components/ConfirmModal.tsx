import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const icons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  danger: { border: '#ef4444', button: '#ef4444', bg: '#ef444420' },
  warning: { border: '#f59e0b', button: '#f59e0b', bg: '#f59e0b20' },
  info: { border: '#0DB8D3', button: '#0DB8D3', bg: '#0DB8D320' },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const Icon = icons[type];
  const colorSet = colors[type];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="modal-content modal-small" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: colorSet.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Icon size={24} color={colorSet.border} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn-secondary"
              onClick={onCancel}
              style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}
            >
              {cancelText}
            </button>
            <button
              className="btn-primary"
              onClick={onConfirm}
              style={{
                background: `linear-gradient(135deg, ${colorSet.button}, ${colorSet.button}dd)`,
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};