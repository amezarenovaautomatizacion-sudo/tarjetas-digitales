import React from 'react';
import PlantillaCard from '../components/PlantillaCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePlantillas } from '../hooks/usePlantillas';

interface HomePageProps {
  onPlantillaClick: (id: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPlantillaClick }) => {
  const { plantillas, loading, error, refetch } = usePlantillas();

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div className="container">
      <div className="error-container">
        <h2>No pudimos cargar las plantillas</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>{error}</p>
        <button className="btn-retry" onClick={refetch}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Plantillas Profesionales para tus Tarjetas Digitales
          </h1>
          <p className="hero-subtitle">
            Crea, personaliza y comparte tus tarjetas digitales en segundos
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{plantillas.length}</span>
              <span className="stat-label">Plantillas Disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="plantillas-grid">
          {plantillas.map((p) => (
            <PlantillaCard
              key={p.plantillaid}
              plantilla={p}
              onClick={() => onPlantillaClick(p.plantillaid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;