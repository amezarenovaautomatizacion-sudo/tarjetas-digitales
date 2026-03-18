import React, { useState } from 'react';
import { UsuarioData } from '../types';
import { usuarioService } from '../services/usuario.service';

interface MiCuentaProps {
  usuarioActual: UsuarioData;
  onLogout: () => void;
  onVolver: () => void;
  onIrAMisTarjetas: () => void;
}

const MiCuenta: React.FC<MiCuentaProps> = ({ usuarioActual, onLogout, onVolver, onIrAMisTarjetas}) => {
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [form, setForm] = useState({
    nombre: usuarioActual?.nombre || '',
    email: usuarioActual?.email || '',
    telefono: (usuarioActual as any)?.telefono || '',
    fecha_nacimiento: (usuarioActual as any)?.fecha_nacimiento || '',
    calle: (usuarioActual as any)?.calle || '',
    numero_exterior: (usuarioActual as any)?.numero_exterior || '',
    colonia: (usuarioActual as any)?.colonia || '',
    ciudad: (usuarioActual as any)?.ciudad || '',
    estado: (usuarioActual as any)?.estado || '',
    codigo_postal: (usuarioActual as any)?.codigo_postal || '',
    rfc: (usuarioActual as any)?.rfc || '',
    razon_social: (usuarioActual as any)?.razon_social || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    password_nuevo: '',
    confirmar_password: ''
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

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password_nuevo !== passwordForm.confirmar_password) {
      setMensaje({ tipo: 'error', texto: 'Las nuevas contraseñas no coinciden' });
      return;
    }

    try {
      setCargando(true);
      await usuarioService.cambiarPassword(
        passwordForm.password_actual, 
        passwordForm.password_nuevo
      );
      setMensaje({ tipo: 'exito', texto: 'Contraseña actualizada correctamente' });
      setPasswordForm({ password_actual: '', password_nuevo: '', confirmar_password: '' });
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al cambiar contraseña' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="perfil-container">
      {/* --- SIDEBAR INTEGRADO --- */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">RENOVA</h2>
          <div className="usuario-info">
            <span className="user-dot online"></span>
            <p>{usuarioActual.nombre || usuarioActual.email}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={onVolver}>
              <i className="bi bi-grid"></i> Dashboard
            </button>
            <button 
              className="nav-item" 
              onClick={onIrAMisTarjetas}
            >
              <i className="bi bi-images"></i> Mis tarjetas
            </button>
            <button className="nav-item active">
              <i className="bi bi-person"></i> Mi Cuenta
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="perfil-main-content">
        <header className="perfil-header-box">
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
          {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
          <div className="perfil-section">
            <h3><i className="bi bi-person-badge"></i> Información Personal</h3>
            <div className="input-group">
              <label>Nombre Completo</label>
              <input name="nombre" value={form.nombre} disabled={!editando || cargando} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input name="email" value={form.email} disabled={!editando || cargando} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Teléfono</label>
              <input name="telefono" value={form.telefono} disabled={!editando || cargando} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} disabled={!editando || cargando} onChange={handleChange} />
            </div>
          </div>

          {/* SECCIÓN 2: DIRECCIÓN */}
          <div className="perfil-section">
            <h3><i className="bi bi-geo-alt"></i> Dirección</h3>
            <div className="input-group-row">
              <div className="input-group">
                <label>Calle</label>
                <input name="calle" value={form.calle} disabled={!editando || cargando} onChange={handleChange} />
              </div>
              <div className="input-group small">
                <label>N° Exterior</label>
                <input name="numero_exterior" value={form.numero_exterior} disabled={!editando || cargando} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label>Colonia</label>
              <input name="colonia" value={form.colonia} disabled={!editando || cargando} onChange={handleChange} />
            </div>
            <div className="input-group-row">
              <div className="input-group">
                <label>Ciudad</label>
                <input name="ciudad" value={form.ciudad} disabled={!editando || cargando} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Estado</label>
                <input name="estado" value={form.estado} disabled={!editando || cargando} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label>Código Postal</label>
              <input name="codigo_postal" value={form.codigo_postal} disabled={!editando || cargando} onChange={handleChange} />
            </div>
          </div>

          {/* SECCIÓN 3: INFORMACIÓN FISCAL */}
          <div className="perfil-section">
            <h3><i className="bi bi-file-earmark-text"></i> Información Fiscal</h3>
            <div className="input-group">
              <label>RFC</label>
              <input name="rfc" value={form.rfc} disabled={!editando || cargando} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="input-group">
              <label>Razón Social</label>
              <input name="razon_social" value={form.razon_social} disabled={!editando || cargando} onChange={handleChange} />
            </div>

            {/* Botones de Acción integrados al final de la última sección o en un div aparte */}
            <div className="acciones-perfil" style={{ marginTop: '20px' }}>
              {!editando ? (
                <button className="btn-editar" onClick={() => setEditando(true)}>
                  <i className="bi bi-pencil"></i> Editar Datos
                </button>
              ) : (
                <>
                  <button className="btn-finalizar" onClick={handleGuardar} disabled={cargando}>
                    {cargando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button className="btn-cancelar" onClick={() => setEditando(false)} disabled={cargando}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="perfil-section">
            <h3><i className="bi bi-shield-lock"></i> Seguridad</h3>
            <form onSubmit={handleCambiarPassword}>
              <div className="input-group">
                <label>Contraseña Actual</label>
                <input 
                  type="password" 
                  value={passwordForm.password_actual}
                  onChange={(e) => setPasswordForm({...passwordForm, password_actual: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordForm.password_nuevo}
                  onChange={(e) => setPasswordForm({...passwordForm, password_nuevo: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Confirmar Nueva</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmar_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmar_password: e.target.value})}
                  required
                />
                <label>Al menos 6 caracteres</label>
              </div>
              <button type="submit" className="btn-finalizar" disabled={cargando}>
                Actualizar Contraseña
              </button>
            </form>
          </div>

          {/* Tarjeta de Detalles */}
          <div className="perfil-section info-sistema">
            <h3>Detalles de la Cuenta</h3>
            <div className="info-item">
              <strong>Miembro desde:</strong> 
              <span>{new Date(usuarioActual.creado).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Última conexión:</strong> 
              <span>{new Date(usuarioActual.ultimo_login).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <strong>Tipo:</strong> <span>{usuarioActual.tipo}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MiCuenta;