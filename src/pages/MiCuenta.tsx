import React, { useState } from 'react';
import { UsuarioData } from '../types';
import { usuarioService } from '../services/usuario.service';

interface MiCuentaProps {
  usuarioActual: UsuarioData;
  onLogout: () => void;
  onVolver: () => void;
}

const MiCuenta: React.FC<MiCuentaProps> = ({ usuarioActual, onLogout, onVolver }) => {
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({
    nombre: usuarioActual?.nombre || '',
    email: usuarioActual?.email || '',
    telefono: (usuarioActual as any).telefono || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      setCargando(true);
      await usuarioService.actualizarPerfil(form);
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente' });
      setEditando(false);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar perfil' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="perfil-container">
      <button className="btn-volver" onClick={onVolver}>
        <i className="bi bi-arrow-left"></i> Volver al Dashboard
      </button>

      <header className="perfil-header">
        <h1>
          <i className="bi bi-person-circle"></i> Mi Perfil 
          <span className="id-badge">ID: {usuarioActual.usuarioid}</span>
        </h1>
        <p className="status-text">
          <i className={`bi ${usuarioActual.activo ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}></i>
          Estado: {usuarioActual.activo ? 'Activo' : 'Inactivo'}
        </p>
      </header>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          <i className={`bi ${mensaje.tipo === 'exito' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}></i>
          {mensaje.texto}
        </div>
      )}

      <section className="perfil-grid">
        <div className="perfil-section">
          <h3>Información Personal</h3>
          <div className="input-group">
            <label><i className="bi bi-person"></i> Nombre Completo</label>
            <input 
              name="nombre" 
              value={form.nombre} 
              disabled={!editando || cargando} 
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label><i className="bi bi-envelope"></i> Correo Electrónico</label>
            <input 
              name="email" 
              value={form.email} 
              disabled={!editando || cargando} 
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label><i className="bi bi-telephone"></i> Teléfono</label>
            <input 
              name="telefono" 
              value={form.telefono} 
              disabled={!editando || cargando} 
              onChange={handleChange}
            />
          </div>
          
          <div className="acciones-perfil">
            {editando ? (
              <>
                <button 
                  className="btn-finalizar" 
                  onClick={handleGuardar}
                  disabled={cargando}
                >
                  {cargando ? (
                    <> <i className="bi bi-arrow-repeat spin"></i> Guardando...</>
                  ) : (
                    <> <i className="bi bi-check-lg"></i> Guardar Cambios</>
                  )}
                </button>
                <button 
                  className="btn-cancelar" 
                  onClick={() => setEditando(false)}
                  disabled={cargando}
                >
                  <i className="bi bi-x-lg"></i> Cancelar
                </button>
              </>
            ) : (
              <button 
                className="btn-editar" 
                onClick={() => setEditando(true)}
              >
                <i className="bi bi-pencil"></i> Editar Datos
              </button>
            )}
          </div>
        </div>

        <div className="perfil-section info-sistema">
          <h3>Detalles de la Cuenta</h3>
          <div className="info-item">
            <strong><i className="bi bi-calendar"></i> Miembro desde:</strong> 
            <span>{new Date(usuarioActual.creado).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <strong><i className="bi bi-clock-history"></i> Última conexión:</strong> 
            <span>{new Date(usuarioActual.ultimo_login).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <strong><i className="bi bi-shield-lock"></i> IP de acceso:</strong> 
            <span>{usuarioActual.ip_ultimo_login}</span>
          </div>
          <div className="info-item">
            <strong><i className="bi bi-tag"></i> Tipo de usuario:</strong> 
            <span>{usuarioActual.tipo}</span>
          </div>
          <div className="info-item">
            <strong><i className="bi bi-key"></i> Rol ID:</strong> 
            <span>{usuarioActual.rolid}</span>
          </div>
        </div>
      </section>

      <div className="perfil-acciones">
        <button className="btn-logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default MiCuenta;