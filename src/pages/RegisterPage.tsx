import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { obtenerIpPublica } from '../utils/ipUtils';
import { useNotification } from '../contexts/NotificationContext';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', telefono: '', calle: '',
    numero_exterior: '', colonia: '', ciudad: '', estado: '', codigo_postal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ip = await obtenerIpPublica();
    const response = await authService.registerCliente({ ...formData, ip_registro: ip });
    if (response.error) {
      setError(response.error);
      showError(response.error, 'Error de registro');
    } else {
      showSuccess('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'Registro exitoso');
      onRegisterSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '680px' }}>
        <h2>Registro de Cliente</h2>

        <form onSubmit={handleSubmit} noValidate>

          <p className="form-section-label">Datos de acceso</p>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                minLength={6}
              />
              <small className="form-help">Mínimo 6 caracteres</small>
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="10 dígitos"
              />
            </div>
          </div>

          <p className="form-section-label">Dirección</p>

          <div className="form-row">
            <div className="form-group">
              <label>Calle</label>
              <input
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                placeholder="Nombre de la calle"
              />
            </div>
            <div className="form-group">
              <label>Número Exterior</label>
              <input
                name="numero_exterior"
                value={formData.numero_exterior}
                onChange={handleChange}
                placeholder="Ej. 123"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Colonia</label>
              <input
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                placeholder="Nombre de la colonia"
              />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Tu ciudad"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <input
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="Tu estado"
              />
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                placeholder="00000"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;