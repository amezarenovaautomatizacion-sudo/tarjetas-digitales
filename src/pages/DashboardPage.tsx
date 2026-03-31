import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaCard from '../components/TarjetaCard';
import CrearTarjetaModal from '../components/CrearTarjetaModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { tarjetaService } from '../services/tarjeta.service';
import { api } from '../services/api';
import { Plantilla } from '../types';

interface DashboardPageProps {
  onPlantillaClick: (id: number) => void;
  onTarjetaPublicaClick: (slug: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onPlantillaClick, 
  onTarjetaPublicaClick 
}) => {
  const navigate = useNavigate();
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const loadData = async () => {
    setLoading(true);
    const [tarjetasRes, plantillasRes] = await Promise.all([
      tarjetaService.listar(),
      api.getPlantillas({ activo: true })
    ]);
    if (tarjetasRes.data) setTarjetas(tarjetasRes.data.tarjetas || []);
    if (plantillasRes.data) setPlantillas(plantillasRes.data.plantillas);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta tarjeta?')) {
      await tarjetaService.eliminar(id);
      loadData();
    }
  };

  const handleToggleVisibility = async (id: number, current: string) => {
    await tarjetaService.actualizar(id, {
      visibilidad: current === 'publico' ? 'privado' : 'publico'
    });
    loadData();
  };

  const handleEditTarjeta = (tarjetaId: number) => {
    console.log('[Dashboard] Navegando a editar tarjeta con ID:', tarjetaId);
    navigate(`/editar-tarjeta/${tarjetaId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>Mi Cuenta</h1>
          <p>Bienvenido, {userData.nombre || userData.email}</p>
          <button className="btn-primary btn-create" onClick={() => setModalOpen(true)}>
            + Crear Nueva Tarjeta
          </button>
        </div>
      </div>

      <div className="container">
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

        <div className="section-header">
          <h2>Mis Tarjetas</h2>
          <button className="btn-secondary btn-sm" onClick={() => setModalOpen(true)}>
            + Nueva Tarjeta
          </button>
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
        onSuccess={loadData}
      />
    </div>
  );
};

export default DashboardPage;