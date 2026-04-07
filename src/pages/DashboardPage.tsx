import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaCard from '../components/TarjetaCard';
import CrearTarjetaModal from '../components/CrearTarjetaModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { tarjetaService } from '../services/tarjeta.service';
import { api } from '../services/api';
import { Plantilla } from '../types';
import { suscripcionService } from '../services/suscripcion.service';

interface DashboardPageProps {
  onPlantillaClick: (id: number) => void;
  onTarjetaPublicaClick: (slug: string) => void;
}

interface Tarjeta {
  tarjetaclienteid: number;
  slug: string;
  visibilidad: 'publico' | 'privado';
  visitas?: number;
  [key: string]: any;
}

interface DashboardStats {
  suscripcion: {
    activa: boolean;
    plan?: {
      nombre: string;
    };
    dias_restantes: number;
    tarjetas_restantes: number;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onPlantillaClick, 
  onTarjetaPublicaClick 
}) => {
  const navigate = useNavigate();
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [tarjetasRes, plantillasRes] = await Promise.all([
        tarjetaService.listar(),
        api.getPlantillas({ activo: true })
      ]);
      if (tarjetasRes?.data) setTarjetas(tarjetasRes.data.tarjetas || []);
      if (plantillasRes?.data) setPlantillas(plantillasRes.data.plantillas || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await suscripcionService.getDashboardStats();
      if (response?.data) {
        setDashboardStats(response.data as DashboardStats);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadDashboardStats();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta tarjeta?')) return;
    
    try {
      await tarjetaService.eliminar(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting tarjeta:', err);
      alert('Error al eliminar la tarjeta. Por favor, intenta de nuevo.');
    }
  };

  const handleToggleVisibility = async (id: number, current: string) => {
    try {
      await tarjetaService.actualizar(id, {
        visibilidad: current === 'publico' ? 'privado' : 'publico'
      });
      await loadData();
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Error al cambiar la visibilidad. Por favor, intenta de nuevo.');
    }
  };

  const handleEditTarjeta = (tarjetaId: number) => {
    console.log('[Dashboard] Navegando a editar tarjeta con ID:', tarjetaId);
    navigate(`/editar-tarjeta/${tarjetaId}`);
  };

  const handleCreateSuccess = () => {
    setModalOpen(false);
    loadData();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{error}</h3>
            <button className="btn-primary" onClick={loadData}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>Mi Dashboard</h1>
          <p>Bienvenido, {userData.nombre || userData.email || 'Usuario'}</p>
          <button className="btn-primary btn-create" onClick={() => setModalOpen(true)}>
            + Crear Nueva Tarjeta
          </button>
        </div>
      </div>
      <br /><br />

      <div className="container">
        {!statsLoading && dashboardStats?.suscripcion && (
          <div className="suscripcion-resumen">
            <div className={`suscripcion-badge ${dashboardStats.suscripcion.activa ? 'activa' : 'inactiva'}`}>
              {dashboardStats.suscripcion.activa ? (
                <>
                  <div className="suscripcion-info">
                    <div className="suscripcion-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="suscripcion-text">
                      <span className="suscripcion-plan">
                        Plan <strong>{dashboardStats.suscripcion.plan?.nombre || 'Básico'}</strong>
                      </span>
                      <div className="suscripcion-dias">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{dashboardStats.suscripcion.dias_restantes} días restantes</span>
                      </div>
                    </div>
                  </div>
                  <div className="suscripcion-info">
                    <div className="suscripcion-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M4 10h16" />
                      </svg>
                    </div>
                    <div className="suscripcion-text">
                      <div className="suscripcion-tarjetas">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                          <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                        </svg>
                        <span>{dashboardStats.suscripcion.tarjetas_restantes} tarjetas disponibles</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="suscripcion-info">
                    <div className="suscripcion-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div className="suscripcion-text">
                      <span className="suscripcion-plan">
                        <strong>⚠️ Sin suscripción activa</strong>
                      </span>
                      <span className="suscripcion-dias" style={{ color: 'var(--text-muted)' }}>
                        Activa un plan para crear tarjetas
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn-small btn-primary"
                    onClick={() => navigate('/planes')}
                    style={{
                      background: 'var(--primary-gradient)',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'var(--transition-base)',
                    }}
                  >
                    Ver Planes
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{tarjetas.length}</span>
            <span className="stat-label">Tarjetas Creadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tarjetas.filter(t => t.visibilidad === 'publico').length}</span>
            <span className="stat-label">Tarjetas Públicas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tarjetas.reduce((acc, t) => acc + (t.visitas || 0), 0)}</span>
            <span className="stat-label">Visitas Totales</span>
          </div>
        </div>

        <div className="plantillas-title">
          <h2>Mis Tarjetas</h2>
        </div>

        {tarjetas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📇</div>
            <h3>No tienes tarjetas creadas</h3>
            <p>Comienza creando tu primera tarjeta digital</p>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              Crear Tarjeta
            </button>
          </div>
        ) : (
          <div className="tarjetas-grid">
            {tarjetas.map(t => (
              <TarjetaCard
                key={t.tarjetaclienteid}
                tarjeta={t}
                onEdit={() => handleEditTarjeta(t.tarjetaclienteid)}
                onPublicClick={() => onTarjetaPublicaClick(t.slug)}
                onDelete={() => handleDelete(t.tarjetaclienteid)}
                onToggleVisibility={() => handleToggleVisibility(t.tarjetaclienteid, t.visibilidad)}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>

      <CrearTarjetaModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        plantillas={plantillas}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default DashboardPage;