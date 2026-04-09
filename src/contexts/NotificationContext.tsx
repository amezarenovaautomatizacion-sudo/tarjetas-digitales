import React, { createContext, useContext, useCallback, useState } from 'react';
import { ToastNotification, ToastType } from '../components/ToastNotification';

interface Notification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationContextValue {
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

let globalShowSuccess: ((message: string, title?: string, duration?: number) => void) | null = null;
let globalShowError: ((message: string, title?: string, duration?: number) => void) | null = null;
let globalShowInfo: ((message: string, title?: string, duration?: number) => void) | null = null;
let globalShowWarning: ((message: string, title?: string, duration?: number) => void) | null = null;

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const notify = {
  success: (message: string, title?: string, duration?: number) => {
    globalShowSuccess?.(message, title, duration);
  },
  error: (message: string, title?: string, duration?: number) => {
    globalShowError?.(message, title, duration);
  },
  info: (message: string, title?: string, duration?: number) => {
    globalShowInfo?.(message, title, duration);
  },
  warning: (message: string, title?: string, duration?: number) => {
    globalShowWarning?.(message, title, duration);
  },
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type: ToastType, message: string, title?: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    setNotifications(prev => [...prev, { id, type, message, title, duration }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration || 5000);
  }, [removeNotification]);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    addNotification('success', message, title || '✅ Éxito', duration);
  }, [addNotification]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    addNotification('error', message, title || '❌ Error', duration);
  }, [addNotification]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    addNotification('info', message, title || 'ℹ️ Información', duration);
  }, [addNotification]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    addNotification('warning', message, title || '⚠️ Advertencia', duration);
  }, [addNotification]);

  React.useEffect(() => {
    globalShowSuccess = showSuccess;
    globalShowError = showError;
    globalShowInfo = showInfo;
    globalShowWarning = showWarning;
    
    return () => {
      globalShowSuccess = null;
      globalShowError = null;
      globalShowInfo = null;
      globalShowWarning = null;
    };
  }, [showSuccess, showError, showInfo, showWarning]);

  const value: NotificationContextValue = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {notifications.map(notification => (
            <ToastNotification
              key={notification.id}
              id={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              duration={notification.duration}
              onClose={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};