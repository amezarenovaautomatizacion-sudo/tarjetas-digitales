import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useNotification } from '../contexts/NotificationContext';

interface ForgotPasswordPageProps {
  tipo?: 'admin' | 'cliente';
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ tipo = 'cliente' }) => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const response = await authService.forgotPassword(email, tipo);
    
    if (response.error) {
      setError(response.error);
      showError(response.error, 'Error');
    } else {
      setSuccess(true);
      showSuccess('Se han enviado instrucciones a tu correo electrónico.', 'Correo enviado');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Recuperar Contraseña</h2>
        
        {success ? (
          <div>
            <div className="success-message">
              Se han enviado instrucciones a tu correo electrónico.
            </div>
            <p>Revisa tu bandeja de entrada y sigue los pasos para restablecer tu contraseña.</p>
            <button 
              className="btn-primary mt-3 w-100"
              onClick={() => navigate('/login')}
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
              <small className="form-help">
                Te enviaremos un enlace para restablecer tu contraseña
              </small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
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

export default ForgotPasswordPage;