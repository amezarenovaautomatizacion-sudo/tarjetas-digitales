import React, { useState } from 'react';
import { twoFactorService } from '../services/twoFactor.service';
import { useNotification } from '../contexts/NotificationContext';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  tipo: string;
  onVerified: (token: string) => void;
}

interface TwoFactorVerifyResponse {
  token?: string;
  requires_two_factor?: boolean;
  error?: string;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, email, tipo, onVerified }) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await twoFactorService.verifyCode(email, codigo, tipo, useBackupCode) as { data?: TwoFactorVerifyResponse; error?: string };

    if (response.error) {
      setError(response.error);
      showError(response.error, 'Error de verificación');
    } else if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      showSuccess('Verificación exitosa', 'Bienvenido');
      onVerified(response.data.token);
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    const response = await twoFactorService.sendCode(email, tipo);
    if (response.error) {
      setError(response.error);
      showError(response.error, 'Error');
    } else {
      setError('');
      showSuccess('Nuevo código enviado a tu correo', 'Código reenviado');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Verificación de dos pasos</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Ingresa el código de verificación enviado a tu correo electrónico.</p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useBackupCode}
                onChange={(e) => setUseBackupCode(e.target.checked)}
              />
              Usar código de respaldo
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{useBackupCode ? 'Código de respaldo' : 'Código de 6 dígitos'}</label>
              <input
                type={useBackupCode ? 'text' : 'text'}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder={useBackupCode ? 'XXXX-XXXX-XXXX' : '000000'}
                required
                maxLength={useBackupCode ? 16 : 6}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '2px' }}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>

          {!useBackupCode && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#0DB8D3', cursor: 'pointer' }}
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;