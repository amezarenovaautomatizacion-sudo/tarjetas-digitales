import React, { useState } from 'react';
// Importación corregida: asegúrate de que el archivo exista en esa ruta

interface UsuarioData {
  usuarioid: number;
  nombre: string;
  email: string;
  activo: boolean;
  creado: string;
  ultimo_login: string;
  ip_ultimo_login: string;
  rolid: number;
  tipo: string;
}


interface MiCuentaProps {
  usuarioActual: UsuarioData;
  onLogout: () => void; // Esta línea es fundamental
  onActualizar?: (nuevosDatos: Partial<UsuarioData>) => void;
}

const MiCuenta: React.FC<MiCuentaProps> = ({ usuarioActual, onLogout }) => {
  const [editando, setEditando] = useState(false);
  // El estado debe inicializarse con los datos del usuarioActual
  const [form, setForm] = useState({
    nombre: usuarioActual?.nombre || '',
    email: usuarioActual?.email || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <h1>Mi Perfil <span className="id-badge">ID: {usuarioActual.usuarioid}</span></h1>
        <p className="status-text">
          Estado: {usuarioActual.activo === 1 ? '✅ Activo' : '❌ Inactivo'}
        </p>
      </header>

      <section className="perfil-grid">
        {/* CAMPOS EDITABLES */}
        <div className="perfil-section">
          <h3>Información Personal</h3>
          <div className="input-group">
            <label>Nombre Completo</label>
            <input 
              name="nombre" 
              value={form.nombre} 
              disabled={!editando} 
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              name="email" 
              value={form.email} 
              disabled={!editando} 
              onChange={handleChange}
            />
          </div>
          
          <button 
            className={editando ? "btn-finalizar" : "btn-usar"} 
            onClick={() => setEditando(!editando)}
          >
            {editando ? "Guardar Cambios" : "Editar Datos"}
          </button>
        </div>

        {/* DATOS DE SISTEMA (LECTURA) */}
        <div className="perfil-section info-sistema">
          <h3>Detalles de la Cuenta</h3>
          <div className="info-item">
            <strong>Miembro desde:</strong> 
            <span>{new Date(usuarioActual.creado).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <strong>Última conexión:</strong> 
            <span>{usuarioActual.ultimo_login}</span>
          </div>
          <div className="info-item">
            <strong>IP de acceso:</strong> 
            <span>{usuarioActual.ip_ultimo_login}</span>
          </div>
          <div className="info-item">
            <strong>ID de Rol:</strong> 
            <span>{usuarioActual.rolid}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MiCuenta;