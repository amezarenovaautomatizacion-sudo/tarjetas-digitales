import React from 'react';
import { Eye, Calendar, Layers, Sparkles } from 'lucide-react';
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
        {plantilla.categoria_nombre && (
          <span className="plantilla-category">
            <Sparkles size={12} /> {plantilla.categoria_nombre}
          </span>
        )}
      </div>
      <div className="plantilla-card-body">
        <div className="plantilla-preview-placeholder">
          <span>🎴</span>
        </div>
        <p className="plantilla-description">{plantilla.descripcion || 'Sin descripción disponible'}</p>
        <div className="plantilla-stats">
          <span><Layers size={14} /> {plantilla.total_variables} variables</span>
          <span><Eye size={14} /> {plantilla.visitas} visitas</span>
          <span><Calendar size={14} /> {formatDate(plantilla.creado)}</span>
        </div>
      </div>
      <div className="plantilla-card-footer">
        <button className="btn-preview-sm">Ver Detalles →</button>
      </div>
    </div>
  );
};

export default PlantillaCard;
