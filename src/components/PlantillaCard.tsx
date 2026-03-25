// src/components/PlantillaCard.tsx
import React from 'react';
import { Plantilla } from '../types';

interface PlantillaCardProps {
  plantilla: Plantilla;
  onClick: () => void;
}

const PlantillaCard: React.FC<PlantillaCardProps> = ({ plantilla, onClick }) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-MX');

  return (
    <div className="plantilla-card" onClick={onClick}>
      <div className="plantilla-card-header">
        <h3 className="plantilla-card-title">{plantilla.nombre}</h3>
        {plantilla.categoria_nombre && <span className="plantilla-category">{plantilla.categoria_nombre}</span>}
      </div>
      <div className="plantilla-card-body">
        <div className="plantilla-preview-placeholder">
          <span>🎴</span>
        </div>
        <p className="plantilla-description">{plantilla.descripcion || 'Sin descripción disponible'}</p>
        <div className="plantilla-stats">
          <span>📊 {plantilla.total_variables} variables</span>
          <span>👁️ {plantilla.visitas} visitas</span>
        </div>
      </div>
      <div className="plantilla-card-footer">
        <small>Desde: {formatDate(plantilla.creado)}</small>
      </div>
    </div>
  );
};

export default PlantillaCard;