import React, { useState, ChangeEvent } from 'react';

// 1. Definimos la interfaz para una Plantilla
interface Plantilla {
  id: number;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
}

// 2. Definimos la interfaz para el usuario (reutilizable)
interface Usuario {
  email: string;
}

// 3. Definimos las Props del Dashboard
interface DashboardProps {
  usuario: Usuario | null;
  onLogout: () => void;
  onSolicitarLogin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ usuario, onLogout, onSolicitarLogin }) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaActual, setCategoriaActual] = useState<string>('Todas');

  const plantillas: Plantilla[] = [
    { id: 1, nombre: 'Ejecutiva Pro', categoria: 'Profesional', color: '#4a90e2', icono: '💼' },
    { id: 2, nombre: 'Diseño Creativo', categoria: 'Creativa', color: '#f1c40f', icono: '🎨' },
    { id: 3, nombre: 'Corporativa Dark', categoria: 'Corporativa', color: '#2c3e50', icono: '🏢' },
    { id: 4, nombre: 'Minimalista White', categoria: 'Profesional', color: '#bdc3c7', icono: '⚪' },
    { id: 5, nombre: 'Portfolio Art', categoria: 'Creativa', color: '#e74c3c', icono: '🖼️' },
    { id: 6, nombre: 'Tech StartUp', categoria: 'Corporativa', color: '#2ecc71', icono: '🚀' },
  ];

  const categorias: string[] = ['Todas', 'Profesional', 'Creativa', 'Corporativa'];

  const plantillasFiltradas = plantillas.filter((p: Plantilla) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActual === 'Todas' || p.categoria === categoriaActual;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">RENOVA</h2>
          <div className="usuario-info">
            <span className={`user-dot ${usuario ? 'online' : 'offline'}`}></span>
            <p>{usuario ? usuario.email : 'Modo Invitado'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item active">📊 Dashboard</button>
            <button className="nav-item">📇 Ver Diseños</button>
            {usuario && <button className="nav-item">⚙️ Mi Cuenta</button>}
          </nav>
        </div>

        <div className="sidebar-footer">
          {usuario ? (
            <button className="btn-logout" onClick={onLogout}>🚪 Cerrar Sesión</button>
          ) : (
            <div className="login-prompt">
              <p>¿Tienes una cuenta?</p>
              <button className="btn-login-link" onClick={onSolicitarLogin}>🔑 Iniciar Sesión</button>
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
                  onClick={!usuario ? onSolicitarLogin : undefined}
                >
                  Usar esta plantilla
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;