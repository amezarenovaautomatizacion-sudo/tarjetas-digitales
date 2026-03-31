import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { twoFactorService } from '../services/twoFactor.service';
import { obtenerIpPublica } from '../utils/ipUtils';
import LoadingSpinner from '../components/LoadingSpinner';

interface PerfilPageProps {
  onBack: () => void;
}

interface PerfilData {
  nombre?: string;
  email?: string;
  telefono?: string;
  calle?: string;
  numero_exterior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
}

const PerfilPage: React.FC<PerfilPageProps> = ({ onBack }) => {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<PerfilData>({});
  const [passwordData, setPasswordData] = useState({ password_actual: '', password_nuevo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    loadPerfil();
    loadTwoFactorStatus();
  }, []);

  const loadPerfil = async () => {
    const response = await authService.getProfile();
    if (response.data) {
      setPerfil(response.data.usuario || response.data);
      setFormData(response.data.usuario || response.data);
    }
    setLoading(false);
  };

  const loadTwoFactorStatus = async () => {
    const response = await twoFactorService.getStatus();
    if (response.data) {
      setTwoFactorEnabled(response.data.two_factor_enabled);
      setBackupCodesRemaining(response.data.backup_codes_remaining);
    }
  };

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const response = await authService.updateProfile(formData);
    if (response.data) {
      setPerfil(response.data);
      setEditando(false);
      setMessage('Perfil actualizado correctamente');
    } else {
      setError(response.error || 'Error al actualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const response = await authService.changePassword(passwordData.password_actual, passwordData.password_nuevo);
    if (response.data) {
      setMessage('Contraseña actualizada correctamente');
      setPasswordData({ password_actual: '', password_nuevo: '' });
    } else {
      setError(response.error || 'Error al cambiar contraseña');
    }
  };

  const handleEnableTwoFactor = async () => {
    setTwoFactorLoading(true);
    setError('');
    const response = await twoFactorService.enable();
    if (response.data) {
      setTwoFactorEnabled(true);
      if (response.data.backup_codes) {
        setNewBackupCodes(response.data.backup_codes);
        setShowBackupCodes(true);
      }
      setMessage('2FA activado correctamente. En tu próximo inicio de sesión se te pedirá el código de verificación.');
      loadTwoFactorStatus();
    } else {
      setError(response.error || 'Error al activar 2FA');
    }
    setTwoFactorLoading(false);
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm('¿Estás seguro de desactivar la verificación de dos pasos? Tu cuenta será menos segura.')) return;

    setTwoFactorLoading(true);
    setError('');
    const response = await twoFactorService.disable();
    if (response.data) {
      setTwoFactorEnabled(false);
      setMessage('2FA desactivado correctamente');
      loadTwoFactorStatus();
    } else {
      setError(response.error || 'Error al desactivar 2FA');
    }
    setTwoFactorLoading(false);
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('Esto generará nuevos códigos de respaldo. Los anteriores dejarán de funcionar. ¿Continuar?')) return;

    setTwoFactorLoading(true);
    setError('');
    const response = await twoFactorService.regenerateBackupCodes();
    if (response.data) {
      setMessage('Nuevos códigos de respaldo han sido enviados a tu correo electrónico');
      loadTwoFactorStatus();
    } else {
      setError(response.error || 'Error al regenerar códigos de respaldo');
    }
    setTwoFactorLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="perfil-page">
      <div className="container">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="perfil-container">
          <h1>Mi Perfil</h1>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="perfil-section">
            <h2>Información Personal</h2>
            {editando ? (
              <form onSubmit={handleUpdatePerfil}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={formData.telefono || ''} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Calle</label>
                    <input value={formData.calle || ''} onChange={(e) => setFormData({ ...formData, calle: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Número Exterior</label>
                    <input value={formData.numero_exterior || ''} onChange={(e) => setFormData({ ...formData, numero_exterior: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Colonia</label>
                    <input value={formData.colonia || ''} onChange={(e) => setFormData({ ...formData, colonia: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input value={formData.ciudad || ''} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Estado</label>
                    <input value={formData.estado || ''} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Código Postal</label>
                    <input value={formData.codigo_postal || ''} onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Guardar Cambios</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="perfil-info">
                <p><strong>Nombre:</strong> {perfil?.nombre || 'No especificado'}</p>
                <p><strong>Email:</strong> {perfil?.email}</p>
                <p><strong>Teléfono:</strong> {perfil?.telefono || 'No especificado'}</p>
                <p><strong>Dirección:</strong> {perfil?.calle || ''} {perfil?.numero_exterior || ''}, {perfil?.colonia || ''}, {perfil?.ciudad || ''}, {perfil?.estado || ''} {perfil?.codigo_postal || ''}</p>
                <button className="btn-primary" onClick={() => setEditando(true)}>Editar Perfil</button>
              </div>
            )}
          </div>

          <div className="perfil-section">
            <h2>Cambiar Contraseña</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.password_actual}
                  onChange={(e) => setPasswordData({ ...passwordData, password_actual: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.password_nuevo}
                  onChange={(e) => setPasswordData({ ...passwordData, password_nuevo: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary">Actualizar Contraseña</button>
            </form>
          </div>

          <div className="perfil-section">
            <h2>🔐 Verificación de dos pasos (2FA)</h2>

            <div style={{ marginBottom: '1rem' }}>
              <p>La verificación de dos pasos añade una capa extra de seguridad a tu cuenta. Cuando inicies sesión, recibirás un código de 6 dígitos por correo electrónico que deberás ingresar además de tu contraseña.</p>

              <div style={{
                background: twoFactorEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                padding: '1rem',
                borderRadius: '12px',
                marginTop: '1rem'
              }}>
                <p><strong>Estado actual:</strong> {twoFactorEnabled ? '✅ Activado' : '❌ Desactivado'}</p>
                {twoFactorEnabled && backupCodesRemaining > 0 && (
                  <p><strong>Códigos de respaldo disponibles:</strong> {backupCodesRemaining} de 8</p>
                )}
              </div>
            </div>

            <div className="form-actions">
              {!twoFactorEnabled ? (
                <button
                  className="btn-primary"
                  onClick={handleEnableTwoFactor}
                  disabled={twoFactorLoading}
                >
                  {twoFactorLoading ? 'Activando...' : 'Activar 2FA'}
                </button>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={handleRegenerateBackupCodes}
                    disabled={twoFactorLoading}
                  >
                    Regenerar códigos de respaldo
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleDisableTwoFactor}
                    disabled={twoFactorLoading}
                  >
                    Desactivar 2FA
                  </button>
                </>
              )}
            </div>

            {showBackupCodes && newBackupCodes.length > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(13, 184, 211, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(13, 184, 211, 0.3)'
              }}>
                <h4 style={{ color: '#0DB8D3', marginBottom: '0.5rem' }}>📋 Tus códigos de respaldo</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Guarda estos códigos en un lugar seguro. Cada código puede usarse una sola vez.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {newBackupCodes.map((code, index) => (
                    <code key={index} style={{
                      background: '#1f2937',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}>
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  className="btn-small"
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => setShowBackupCodes(false)}
                >
                  He guardado los códigos
                </button>
              </div>
            )}

            {!twoFactorEnabled && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(13,184,211,0.05)', borderRadius: '12px' }}>
                <h4>📱 ¿Cómo funciona?</h4>
                <ol style={{ marginLeft: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                  <li>Activa 2FA haciendo clic en el botón "Activar 2FA"</li>
                  <li>Recibirás un correo con 8 códigos de respaldo (guárdalos en un lugar seguro)</li>
                  <li>A partir de ahora, al iniciar sesión recibirás un código de 6 dígitos por correo</li>
                  <li>Ingresa ese código para completar el inicio de sesión</li>
                  <li>Si pierdes acceso a tu correo, usa uno de los códigos de respaldo</li>
                </ol>
              </div>
            )}

            {twoFactorEnabled && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <h4 style={{ color: '#f59e0b' }}>⚠️ Información importante</h4>
                <ul style={{ marginLeft: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                  <li>Los códigos de respaldo fueron enviados a tu correo cuando activaste 2FA</li>
                  <li>Puedes regenerar nuevos códigos de respaldo en cualquier momento</li>
                  <li>Si pierdes acceso a tu correo y a tus códigos de respaldo, contacta a soporte</li>
                  <li>Cada código de respaldo es de un solo uso</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;