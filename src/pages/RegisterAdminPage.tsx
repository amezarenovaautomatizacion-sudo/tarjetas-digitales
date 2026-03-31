// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { obtenerIpPublica } from '../utils/ipUtils';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

const RegisterAdminPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const ip = await obtenerIpPublica();
    
    const response = await authService.registerAdmin({ 
      ...formData, 
      ip_registro: ip 
    });
    
    if (response.error) {
      setError(response.error);
    } else {
      onRegisterSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Registro de Administrador</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre*</label>
              <input value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email*</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Contraseña*</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdminPage;