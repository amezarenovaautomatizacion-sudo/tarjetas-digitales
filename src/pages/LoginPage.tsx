import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { twoFactorService } from '../services/twoFactor.service';
import { obtenerIpPublica } from '../utils/ipUtils';
import { useNotification } from '../contexts/NotificationContext';

interface LoginPageProps {
  onLoginSuccess: (userType: string, rolid: number) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [tempData, setTempData] = useState({ email: '', password: '', tipo: '', ip: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const ip = await obtenerIpPublica();

    try {
      const response = await authService.login({
        email,
        password,
        tipo,
        ip_ultimo_login: ip
      });

      if (response.data?.requires_two_factor === true) {
        setTempData({ email, password, tipo, ip });
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      if (response.data?.error === "Se requiere código de verificación") {
        setTempData({ email, password, tipo, ip });
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error);
        showError(response.error, 'Error de inicio de sesión');
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        const rolid = response.data.usuario?.rolid || (tipo === 'admin' ? 3 : 4);
        showSuccess(`Bienvenido ${response.data.usuario?.nombre || email}`, 'Inicio de sesión exitoso');
        onLoginSuccess(tipo, rolid);
      }
    } catch (err) {
      setError('Error de conexión');
      showError('Error de conexión con el servidor', 'Error');
    }

    setLoading(false);
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: tempData.email,
        password: tempData.password,
        tipo: tempData.tipo,
        ip_ultimo_login: tempData.ip,
        two_factor_code: useBackupCode ? undefined : twoFactorCode,
        backup_code: useBackupCode ? twoFactorCode : undefined
      });

      if (response.error) {
        setError(response.error);
        showError(response.error, 'Error de verificación');
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        setShowTwoFactor(false);
        setTwoFactorCode('');
        const rolid = response.data.usuario?.rolid || (tempData.tipo === 'admin' ? 3 : 4);
        showSuccess('Verificación exitosa', 'Bienvenido');
        onLoginSuccess(tempData.tipo, rolid);
      }
    } catch {
      setError('Error de conexión');
      showError('Error de conexión con el servidor', 'Error');
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await twoFactorService.sendCode(tempData.email, tempData.tipo);
      if (response.error) {
        setError(response.error);
        showError(response.error, 'Error');
      } else {
        showSuccess('Nuevo código enviado a tu correo electrónico', 'Código reenviado');
      }
    } catch {
      setError('Error al reenviar el código');
      showError('Error al reenviar el código', 'Error');
    }
    setLoading(false);
  };

  if (showTwoFactor) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h2>🔐 Verificación de dos pasos</h2>
          <p className="auth-container-description">
            Se ha enviado un código de verificación a <strong>{tempData.email}</strong>
          </p>

          <form onSubmit={handleTwoFactorSubmit}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={useBackupCode} onChange={(e) => { setUseBackupCode(e.target.checked); setTwoFactorCode(''); }} />
                Usar código de respaldo
              </label>
            </div>

            <div className="form-group">
              <label>{useBackupCode ? 'Código de respaldo' : 'Código de 6 dígitos'}</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                placeholder={useBackupCode ? 'XXXX-XXXX-XXXX' : '000000'}
                required
                maxLength={useBackupCode ? 16 : 6}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', fontFamily: 'monospace' }}
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>

          {!useBackupCode && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button type="button" onClick={handleResendCode} disabled={loading} style={{ background: 'none', border: 'none', color: '#0DB8D3', cursor: 'pointer', textDecoration: 'underline' }}>
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          )}

          <div className="auth-links" style={{ marginTop: '1.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowTwoFactor(false); setTwoFactorCode(''); setUseBackupCode(false); }}>
              ← Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de Usuario</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador / Editor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••"
                style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#888', display: 'flex', alignItems: 'center' }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="auth-links">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = tipo === 'admin' ? '/forgot-password' : '/cliente/forgot-password'; }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;