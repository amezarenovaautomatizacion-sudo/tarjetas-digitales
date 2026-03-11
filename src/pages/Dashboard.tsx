import React, { useState, ChangeEvent, useEffect } from 'react';
import { plantillaService } from '../services/plantilla.service';
import { Plantilla } from '../types';

interface Usuario {
  email: string;
  nombre?: string;
}

interface DashboardProps {
  usuario: Usuario | null;
  onLogout: () => void;
  onSolicitarLogin: () => void;
  onIrACuenta: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  usuario, 
  onLogout, 
  onSolicitarLogin,
  onIrACuenta 
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaActual, setCategoriaActual] = useState<string>('Todas');
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const data = await plantillaService.obtenerTodas();
      setPlantillas(data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    } finally {
      setCargando(false);
    }
  };

  const categorias: string[] = ['Todas', 'Profesional', 'Creativa', 'Corporativa'];

  const plantillasFiltradas = plantillas.filter((p: Plantilla) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActual === 'Todas' || p.categoria === categoriaActual;
    return coincideBusqueda && coincideCategoria;
  });

  const handleUsarPlantilla = (plantillaId: number) => {
    if (!usuario) {
      onSolicitarLogin();
    } else {
      console.log('Usando plantilla:', plantillaId);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">RENOVA</h2>
          <div className="usuario-info" onClick={usuario ? onIrACuenta : undefined} style={{ cursor: usuario ? 'pointer' : 'default' }}>
            <span className={`user-dot ${usuario ? 'online' : 'offline'}`}></span>
            <p>{usuario ? (usuario.nombre || usuario.email) : 'Modo Invitado'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item active">
              <i className="bi bi-grid"></i> Dashboard
            </button>
            <button className="nav-item">
              <i className="bi bi-images"></i> Ver Diseños nuevos
            </button>
            {usuario && (
              <button className="nav-item" onClick={onIrACuenta}>
                <i className="bi bi-person"></i> Mi Cuenta
              </button>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          {usuario ? (
            <button className="btn-logout" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
            </button>
          ) : (
            <div className="login-prompt">
              <p>¿Tienes una cuenta?</p>
              <button className="btn-login-link" onClick={onSolicitarLogin}>
                <i className="bi bi-key"></i> Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="dash-header">
          <div className="header-text">
            <h1>Explorar Plantillas</h1>
            <p>Encuentra el diseño ideal para tu identidad digital</p>
          </div>
          
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={busqueda}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        <section className="filtros-container">
          {categorias.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${categoriaActual === cat ? 'active' : ''}`}
              onClick={() => setCategoriaActual(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        {cargando ? (
          <div className="cargando-spinner">Cargando plantillas...</div>
        ) : (
          <div className="templates-grid">
            {plantillasFiltradas.map((p: Plantilla) => (
              <div key={p.id} className="template-card">
                <div className="template-preview" style={{ backgroundColor: p.color }}>
                  <span className="preview-icon">{p.icono}</span>
                </div>
                <div className="template-info">
                  <h4>{p.nombre}</h4>
                  <span className="tag-categoria">{p.categoria}</span>
                  <button 
                    className="btn-usar" 
                    onClick={() => handleUsarPlantilla(p.id)}
                  >
                    <i className="bi bi-pencil-square"></i> Usar esta plantilla
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {plantillasFiltradas.length === 0 && !cargando && (
          <div className="sin-resultados">
            <i className="bi bi-emoji-frown"></i>
            <p>No se encontraron plantillas</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;