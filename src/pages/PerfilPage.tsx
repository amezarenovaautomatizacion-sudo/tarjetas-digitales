// src/pages/PerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { obtenerIpPublica } from '../utils/ipUtils';
import LoadingSpinner from '../components/LoadingSpinner';

interface PerfilPageProps {
  onBack: () => void;
}

const PerfilPage: React.FC<PerfilPageProps> = ({ onBack }) => {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ password_actual: '', password_nuevo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPerfil();
  }, []);

  const loadPerfil = async () => {
    const response = await authService.getProfile();
    if (response.data) {
      setPerfil(response.data);
      setFormData(response.data);
    }
    setLoading(false);
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
                    <input value={formData.nombre || ''} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={formData.telefono || ''} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Calle</label>
                    <input value={formData.calle || ''} onChange={(e) => setFormData({...formData, calle: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Número Exterior</label>
                    <input value={formData.numero_exterior || ''} onChange={(e) => setFormData({...formData, numero_exterior: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Colonia</label>
                    <input value={formData.colonia || ''} onChange={(e) => setFormData({...formData, colonia: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input value={formData.ciudad || ''} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Estado</label>
                    <input value={formData.estado || ''} onChange={(e) => setFormData({...formData, estado: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Código Postal</label>
                    <input value={formData.codigo_postal || ''} onChange={(e) => setFormData({...formData, codigo_postal: e.target.value})} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Guardar Cambios</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="perfil-info">
                <p><strong>Nombre:</strong> {perfil.nombre || 'No especificado'}</p>
                <p><strong>Email:</strong> {perfil.email}</p>
                <p><strong>Teléfono:</strong> {perfil.telefono || 'No especificado'}</p>
                <p><strong>Dirección:</strong> {perfil.calle || ''} {perfil.numero_exterior || ''}, {perfil.colonia || ''}, {perfil.ciudad || ''}, {perfil.estado || ''} {perfil.codigo_postal || ''}</p>
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
                  onChange={(e) => setPasswordData({...passwordData, password_actual: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordData.password_nuevo} 
                  onChange={(e) => setPasswordData({...passwordData, password_nuevo: e.target.value})} 
                  required 
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary">Actualizar Contraseña</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;