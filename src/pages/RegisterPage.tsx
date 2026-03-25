// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { obtenerIpPublica } from '../utils/ipUtils';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', telefono: '', calle: '', 
    numero_exterior: '', colonia: '', ciudad: '', estado: '', codigo_postal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const ip = await obtenerIpPublica();
    
    const response = await authService.registerCliente({ 
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
        <h2>Registro de Cliente</h2>
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
          <div className="form-group">
            <label>Teléfono</label>
            <input value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Calle</label>
              <input value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Número Exterior</label>
              <input value={formData.numero_exterior} onChange={(e) => setFormData({...formData, numero_exterior: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Colonia</label>
              <input value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <input value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input value={formData.codigo_postal} onChange={(e) => setFormData({...formData, codigo_postal: e.target.value})} />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;