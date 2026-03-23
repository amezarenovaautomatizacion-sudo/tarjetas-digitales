import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Tu ApiClient con el header corregido
import { plantillaService } from '../services/plantilla.service';
import { Plantilla } from '../types';

// Definimos la interfaz para tus tarjetas guardadas
interface TarjetaPersonal {
  tarjetaclienteid: number;
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
  onEditarTarjeta: (tarjeta: any) => void;
}

const MisTarjetas: React.FC<TarjetasProps> = ({ 
  usuario, 
  onLogout, 
  onSolicitarLogin,
  onIrACuenta,
  onEditarTarjeta
}) => {
  const [tarjetas, setTarjetas] = useState<TarjetaPersonal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tarjetaEditar, setTarjetaEditar] = useState<TarjetaPersonal | null>(null);

  const obtenerMisTarjetas = async () => {
    try {
      setCargando(true);
      
      // LLAMADA AL SERVICE: Aquí usamos lo que acabas de escribir
      const data = await plantillaService.obtenerMisTarjetas();
      
      // ACTUALIZACIÓN DE ESTADO: Esto quita el mensaje de "No tienes tarjetas"
      // El service ya devuelve 'response.tarjetas || []', así que 'data' es el arreglo directo
      setTarjetas(data); 
      
    } catch (error) {
      console.error("Error al cargar tarjetas:", error);
      setTarjetas([]);
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    if (usuario) {
      obtenerMisTarjetas();
    }
  }, [usuario]);

  const handleEliminar = async (id: number) => {
    // 1. Confirmación de seguridad
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) {
      return;
    }

    try {
      // 2. Llamada al servicio
      await plantillaService.eliminarTarjeta(id);
      
      // 3. Actualizar el estado local para quitar la tarjeta de la vista
      // Asumiendo que tu estado se llama 'tarjetas'
      setTarjetas(prevTarjetas => prevTarjetas.filter(t => t.tarjetaclienteid !== id));
      
      alert("Tarjeta eliminada correctamente.");
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar la tarjeta.");
    }
  };
  // Renderizado Condicional: Si estamos editando, mostramos el formulario
  if (tarjetaEditar) {
    return (
      <div className="dashboard-container">
        <div className="main-content">
           <button onClick={() => setTarjetaEditar(null)} className="btn-volver">
             <i className="bi bi-arrow-left"></i> Volver a mis tarjetas
           </button>
           <h2>Editando: {tarjetaEditar.nombre_tarjeta}</h2>
           {/* Aquí puedes reutilizar tu componente EditorTarjeta pasándole los datos */}
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
                <div key={tarjeta.tarjetaclienteid} className="tarjeta-card">
                  <div className="tarjeta-preview">
                     <i className="bi bi-person-badge"></i>
                  </div>
                  <div className="tarjeta-info">
                    <h3>{tarjeta.nombre_tarjeta}</h3>
                    <p>Creada: {new Date(tarjeta.fecha_creacion).toLocaleDateString()}</p>
                    <div className="tarjeta-acciones">
                      <button 
                        className="btn-editar-sm" 
                        onClick={() => onEditarTarjeta(tarjeta)}
                      >
                        <i className="bi bi-pencil-square"></i> Editar
                      </button>
                      <button 
                        className="btn-eliminar-sm"
                        // CAMBIO CLAVE: Pasar tarjetaclienteid
                        onClick={() => handleEliminar(tarjeta.tarjetaclienteid)} 
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