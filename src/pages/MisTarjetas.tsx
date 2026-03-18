import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Tu ApiClient con el header corregido
import { Plantilla } from '../types';

// Definimos la interfaz para tus tarjetas guardadas
interface TarjetaPersonal {
  id: number;
  nombre_tarjeta: string;
  datos: any; // Aquí vienen los campos como puesto, empresa, etc.
  fecha_creacion: string;
}

interface TarjetasProps {
  usuario: any;
  onLogout: () => void;
  onSolicitarLogin: () => void;
  onIrACuenta: () => void;
  onIrADashboard: () => void;
}

const MisTarjetas: React.FC<TarjetasProps> = ({ 
  usuario, 
  onLogout, 
  onSolicitarLogin,
  onIrACuenta 
}) => {
  const [tarjetas, setTarjetas] = useState<TarjetaPersonal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tarjetaEditar, setTarjetaEditar] = useState<TarjetaPersonal | null>(null);

  useEffect(() => {
    if (usuario) {
      cargarMisTarjetas();
    }
  }, [usuario]);

  const cargarMisTarjetas = async () => {
    try {
        setCargando(true);
        const response = await api.get<any>('/api/cliente/mis-tarjetas');
        const listaTarjetas = Array.isArray(response) ? response : (response.tarjetas || []);
        
        setTarjetas(listaTarjetas);
    } catch (error) {
        console.error('Error al cargar tus tarjetas:', error);
        setTarjetas([]); // Evita que quede como undefined
    } finally {
        setCargando(false);
    }
    };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      try {
        await api.delete(`/api/cliente/tarjeta/${id}`);
        setTarjetas(tarjetas.filter(t => t.id !== id));
      } catch (error) {
        alert('No se pudo eliminar la tarjeta');
      }
    }
  };

  // Renderizado Condicional: Si estamos editando, mostramos el formulario
  if (tarjetaEditar) {
    return (
      <div className="dashboard-container">
        {/* Aquí podrías renderizar un componente de Formulario pasándole tarjetaEditar */}
        <div className="perfil-main-content">
           <button onClick={() => setTarjetaEditar(null)} className="btn-back">
             <i className="bi bi-arrow-left"></i> Volver a la lista
           </button>
           <h2>Editando: {tarjetaEditar.nombre_tarjeta}</h2>
           {/* El formulario usaría los campos de tu doc: nombre, puesto, empresa... */}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">RENOVA</h2>
          <div className="usuario-info" onClick={usuario ? onIrACuenta : undefined}>
            <span className={`user-dot ${usuario ? 'online' : 'offline'}`}></span>
            <p>{usuario ? (usuario.nombre || usuario.email) : 'Modo Invitado'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => window.location.href='/dashboard'}>
              <i className="bi bi-grid"></i> Dashboard
            </button>
            <button className="nav-item active">
              <i className="bi bi-images"></i> Mis tarjetas
            </button>
            {usuario && (
              <button className="nav-item" onClick={onIrACuenta}>
                <i className="bi bi-person"></i> Mi Cuenta
              </button>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="perfil-main-content">
        <header className="perfil-header-box">
          <h1><i className="bi bi-card-list"></i> Mis Tarjetas Digitales</h1>
          <p className="status-text">Gestiona y edita tus diseños creados</p>
        </header>

        {cargando ? (
          <div className="loader-container"><i className="bi bi-arrow-repeat spin"></i> Cargando...</div>
        ) : (
          <div className="tarjetas-grid">
            {tarjetas.length === 0 ? (
              <div className="no-data">No tienes tarjetas creadas aún.</div>
            ) : (
              tarjetas.map((tarjeta) => (
                <div key={tarjeta.id} className="tarjeta-card">
                  <div className="tarjeta-preview">
                     <i className="bi bi-person-badge"></i>
                  </div>
                  <div className="tarjeta-info">
                    <h3>{tarjeta.nombre_tarjeta}</h3>
                    <p>Creada: {new Date(tarjeta.fecha_creacion).toLocaleDateString()}</p>
                    <div className="tarjeta-acciones">
                      <button 
                        className="btn-editar-sm" 
                        onClick={() => setTarjetaEditar(tarjeta)}
                      >
                        <i className="bi bi-pencil-square"></i> Editar
                      </button>
                      <button 
                        className="btn-eliminar-sm"
                        onClick={() => handleEliminar(tarjeta.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="tarjeta-card add-new" onClick={() => window.location.href='/plantillas'}>
              <i className="bi bi-plus-circle"></i>
              <p>Crear nueva tarjeta</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisTarjetas;