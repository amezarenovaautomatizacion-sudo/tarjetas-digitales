// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface ResetPasswordPageProps {
  tipo?: 'admin' | 'cliente';
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ tipo = 'cliente' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  // Validar que el token existe
  useEffect(() => {
    if (!token) {
      setError('Token no válido o expirado');
      setValidToken(false);
    } else {
      setValidToken(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const response = await authService.resetPassword(token!, newPassword, tipo);
    
    if (response.error) {
      setError(response.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate(tipo === 'admin' ? '/login' : '/login');
      }, 3000);
    }
    
    setLoading(false);
  };

  if (validToken === false) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h2>Enlace inválido</h2>
          <div className="error-message">
            El enlace de recuperación es inválido o ha expirado.
          </div>
          <button 
            className="btn-primary mt-3 w-100"
            onClick={() => navigate('/login')}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Restablecer Contraseña</h2>
        
        {success ? (
          <div>
            <div className="success-message">
              ¡Contraseña actualizada exitosamente!
            </div>
            <p>Serás redirigido al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite tu nueva contraseña"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}
        
        <div className="auth-links mt-3">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;