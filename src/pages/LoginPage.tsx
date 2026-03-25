// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { authService } from '../services/auth.service';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const ip = await obtenerIpPublica();
    
    const response = await authService.login({ 
      email, 
      password, 
      tipo,
      ip_ultimo_login: ip 
    });
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      onLoginSuccess(tipo);
    }
    setLoading(false);
  };

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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div className="auth-links">
          <a href="#" onClick={() => alert('Funcionalidad de recuperación')}>¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;