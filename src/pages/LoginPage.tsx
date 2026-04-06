import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { twoFactorService } from '../services/twoFactor.service';
import { obtenerIpPublica } from '../utils/ipUtils';

interface LoginPageProps {
  onLoginSuccess: (userType: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        onLoginSuccess(tipo);
      }
    } catch (err) {
      setError('Error de conexión');
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
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        setShowTwoFactor(false);
        setTwoFactorCode('');
        onLoginSuccess(tempData.tipo);
      }
    } catch {
      setError('Error de conexión');
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await twoFactorService.sendCode(tempData.email, tempData.tipo);
      if (response.error) {
        setError(response.error);
      } else {
        alert('Nuevo código enviado a tu correo electrónico');
      }
    } catch {
      setError('Error al reenviar el código');
    }
    setLoading(false);
  };

  if (showTwoFactor) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h2>🔐 Verificación de dos pasos</h2>
          <p className="plantillas-title">
            Se ha enviado un código de verificación a <strong>{tempData.email}</strong>
          </p>

          <form onSubmit={handleTwoFactorSubmit}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useBackupCode}
                  onChange={(e) => {
                    setUseBackupCode(e.target.checked);
                    setTwoFactorCode('');
                  }}
                />
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
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '4px',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />
              <small className="form-help">
                {useBackupCode
                  ? 'Ingresa uno de los códigos de respaldo que guardaste'
                  : 'Ingresa el código de 6 dígitos que recibiste por correo'}
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>

          {!useBackupCode && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0DB8D3',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          )}

          <div className="auth-links" style={{ marginTop: '1.5rem' }}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setShowTwoFactor(false);
              setTwoFactorCode('');
              setUseBackupCode(false);
            }}>
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="auth-links">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.location.href = tipo === 'admin' ? '/forgot-password' : '/cliente/forgot-password';
          }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;