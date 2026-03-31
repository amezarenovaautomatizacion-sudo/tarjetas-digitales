import React, { useState, useEffect } from 'react';
import { twoFactorService } from '../services/twoFactor.service';

const TwoFactorSettings: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const response = await twoFactorService.getStatus();
    if (response.data) {
      setEnabled(response.data.two_factor_enabled);
      setBackupCodesRemaining(response.data.backup_codes_remaining);
    }
    setLoading(false);
  };

  const handleEnable = async () => {
    const response = await twoFactorService.enable();
    if (response.data) {
      setEnabled(true);
      alert('2FA activado. Revisa tu correo para los códigos de respaldo.');
      loadStatus();
    } else {
      alert(response.error || 'Error al activar 2FA');
    }
  };

  const handleDisable = async () => {
    if (confirm('¿Estás seguro de desactivar la verificación de dos pasos?')) {
      const response = await twoFactorService.disable();
      if (response.data) {
        setEnabled(false);
        alert('2FA desactivado correctamente');
        loadStatus();
      } else {
        alert(response.error || 'Error al desactivar 2FA');
      }
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (confirm('Esto generará nuevos códigos de respaldo. Los anteriores dejarán de funcionar. ¿Continuar?')) {
      const response = await twoFactorService.regenerateBackupCodes();
      if (response.data) {
        alert('Nuevos códigos de respaldo enviados a tu correo');
        loadStatus();
      } else {
        alert(response.error || 'Error al regenerar códigos');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="perfil-section">
      <h2>🔐 Verificación de dos pasos (2FA)</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p>La verificación de dos pasos añade una capa extra de seguridad a tu cuenta.</p>
        <p><strong>Estado actual:</strong> {enabled ? '✅ Activado' : '❌ Desactivado'}</p>
        {enabled && backupCodesRemaining > 0 && (
          <p><strong>Códigos de respaldo disponibles:</strong> {backupCodesRemaining}</p>
        )}
      </div>

      <div className="form-actions">
        {!enabled ? (
          <button className="btn-primary" onClick={handleEnable}>
            Activar 2FA
          </button>
        ) : (
          <>
            <button className="btn-secondary" onClick={handleRegenerateBackupCodes}>
              Regenerar códigos de respaldo
            </button>
            <button className="btn-danger" onClick={handleDisable}>
              Desactivar 2FA
            </button>
          </>
        )}
      </div>

      {!enabled && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(13,184,211,0.1)', borderRadius: '12px' }}>
          <h4>📱 ¿Cómo funciona?</h4>
          <ol style={{ marginLeft: '1.5rem', color: '#9ca3af' }}>
            <li>Activa 2FA en esta página</li>
            <li>Recibirás un código de 6 dígitos por correo al iniciar sesión</li>
            <li>Ingresa el código para completar el inicio de sesión</li>
            <li>Guarda los códigos de respaldo en un lugar seguro</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;