import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotificationProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: { icon: CheckCircle, color: '#10b981' },
  error: { icon: AlertCircle, color: '#ef4444' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  info: { icon: Info, color: '#0DB8D3' },
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const { icon: Icon, color } = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className="toast-notification"
      style={{
        position: 'relative',
        marginBottom: '0.75rem',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: `1px solid ${color}40`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: '280px',
        maxWidth: '380px',
        backdropFilter: 'blur(8px)',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <Icon size={20} style={{ color, flexShrink: 0, marginTop: '2px' }} />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {title}
          </div>
        )}
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', wordBreak: 'break-word' }}>
          {message}
        </div>
      </div>
      
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'var(--transition-base)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};