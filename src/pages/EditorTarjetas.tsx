import React, { useState, useEffect } from 'react';

import { plantillaService } from '../services/plantilla.service';
import { UsuarioData } from '../types'; // Asegúrate de importar tu tipo de usuario

interface DatosTarjeta {
  nombre: string;
  apellido: string;
  puesto: string;
  empresa: string;
  email: string;
  telefono: string;
  lema: string;
}

interface EditorProps {
  plantillaId: number;
  tarjetaId?: number; // Añadimos esto para saber si estamos editando una existente
  datosIniciales?: DatosTarjeta; // Para cargar los datos que ya tenías
  usuario: UsuarioData | null;
  color?: string;
  icono?: string;
  onVolver: () => void;
  onIrAMisTarjetas: () => void;
  onIrACuenta: () => void;
  onLogout: () => void;
}

const EditorTarjeta: React.FC<EditorProps> = ({ 
  plantillaId, 
  tarjetaId,
  datosIniciales,
  usuario, 
  color = '#2c3e50', 
  icono = '📇',
  onVolver,
  onIrAMisTarjetas,
  onIrACuenta,
  onLogout
}) => {
  const [datos, setDatos] = useState<DatosTarjeta>({
    nombre: datosIniciales?.nombre || usuario?.nombre || '',
    apellido: datosIniciales?.apellido || '',
    puesto: datosIniciales?.puesto || '',
    empresa: datosIniciales?.empresa || '',
    email: datosIniciales?.email || usuario?.email || '',
    telefono: datosIniciales?.telefono || '',
    lema: datosIniciales?.lema || 'Transformando ideas en realidad'
  });

  useEffect(() => {
    if (tarjetaId) {
      const cargarDatos = async () => {
        try {
          const data = await plantillaService.obtenerTarjetaPorId(tarjetaId);
          // data.datos contiene el JSON con nombre, puesto, etc.
          setDatos(data.datos); 
        } catch (error) {
          console.error("Error al cargar la tarjeta");
        }
      };
      cargarDatos();
    }
  }, [tarjetaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      const nombreDeLaTarjeta = `Mi tarjeta ${datos.nombre}`; 

      if (tarjetaId) {
        // --- CASO EDICIÓN ---
        // Si existe tarjetaId, llamamos al método PUT
        await plantillaService.actualizarTarjeta(
          tarjetaId, 
          nombreDeLaTarjeta, 
          datos
        );
        alert("¡Cambios guardados con éxito!");
      } else {
        // --- CASO CREACIÓN ---
        // Si NO existe tarjetaId, llamamos al método POST original
        await plantillaService.guardarTarjeta(
          plantillaId, 
          nombreDeLaTarjeta, 
          datos
        );
        alert("¡Nueva tarjeta creada!");
      }
      
      onIrAMisTarjetas(); // Regresamos a la lista
    } catch (error: any) {
      console.error("Error al procesar la tarjeta:", error);
      alert("No se pudo procesar la solicitud.");
    }
  };
  return (
    <div className="dashboard-container"> {/* Usamos la misma clase base que el Dashboard */}
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">RENOVA</h2>
          <div className="usuario-info" onClick={usuario ? onIrACuenta : undefined} style={{ cursor: usuario ? 'pointer' : 'default' }}>
            <span className={`user-dot ${usuario ? 'online' : 'offline'}`}></span>
            <p>{usuario ? (usuario.nombre || usuario.email) : 'Modo Invitado'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={onVolver}>
              <i className="bi bi-grid"></i> Dashboard
            </button>
            <button className="nav-item" onClick={onIrAMisTarjetas}>
              <i className="bi bi-images"></i> Mis tarjetas
            </button>
            {usuario && (
              <button className="nav-item" onClick={onIrACuenta}>
                <i className="bi bi-person"></i> Mi Cuenta
              </button>
            )}
          </nav>
        </div>
        
        <div className="sidebar-bottom">
          <button className="logout-button" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL DEL EDITOR --- */}
      <main className="main-content">
        <header className="content-header">
          <h1>Editor de Tarjeta</h1>
          <button className="btn-volver" onClick={onVolver}>
            <i className="bi bi-arrow-left"></i> Volver al Catálogo
          </button>
        </header>

        <div className="editor-layout">
          {/* PANEL IZQUIERDO: FORMULARIO */}
          <div className="editor-panel">
            <h3>Personaliza tu Diseño</h3>
            <div className="form-grid">
              <input name="nombre" value={datos.nombre} placeholder="Nombre" onChange={handleChange} />
              <input name="apellido" placeholder="Apellido" onChange={handleChange} />
              <input name="puesto" placeholder="Puesto / Profesión" onChange={handleChange} />
              <input name="empresa" placeholder="Empresa" onChange={handleChange} />
              <input name="email" value={datos.email} placeholder="Correo Electrónico" onChange={handleChange} />
              <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
              <textarea 
                name="lema" 
                placeholder="Frase o Lema" 
                onChange={(e: any) => setDatos({...datos, lema: e.target.value})}
                className="full-width"
              />
            </div>
            <button onClick={handleGuardar} className="btn-save">
              <i className="bi bi-check-circle"></i> Confirmar y Guardar
            </button>
          </div>

          {/* PANEL DERECHO: PREVIEW */}
          <div className="preview-panel">
            <div className="card-render" style={{ borderTop: `10px solid ${color}` }}>
              <div className="card-header">
                <span className="card-icon">{icono}</span>
                <div>
                  <h3>{datos.nombre || 'Nombre'} {datos.apellido}</h3>
                  <p className="puesto-text">{datos.puesto || 'Tu Puesto'}</p>
                </div>
              </div>
              <div className="card-body">
                <p><strong>🏢 {datos.empresa || 'Empresa S.A.'}</strong></p>
                <p>📧 {datos.email || 'correo@ejemplo.com'}</p>
                <p>📞 {datos.telefono || '555-000-000'}</p>
              </div>
              <div className="card-footer">
                <small>"{datos.lema}"</small>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorTarjeta;