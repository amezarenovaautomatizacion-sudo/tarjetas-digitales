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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
          <h3 className="plantilla-card-title" style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {plantilla.nombre}
          </h3>
        </div>
        {plantilla.categoria_nombre && (
          <span className="plantilla-category"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Sparkles size={10} /> {plantilla.categoria_nombre}
          </span>
        )}
      </div>

      <div className="plantilla-card-body">
        <div className="plantilla-preview-placeholder">
          <span>🎴</span>
        </div>

        <p className="plantilla-description">
          {plantilla.descripcion || 'Sin descripción disponible'}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
          paddingTop: 'var(--spacing-sm)',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'var(--spacing-sm)',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={13} style={{ color: 'var(--primary)' }} />
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              {plantilla.total_variables}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>variables</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={13} style={{ color: 'var(--primary)' }} />
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              {plantilla.visitas ?? 0}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>visitas</span>
          </div>

          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            <Calendar size={10} /> {formatDate(plantilla.creado)}
          </span>
        </div>
      </div>

      <div className="plantilla-card-footer">
        <button className="btn-preview-sm">Ver Detalles →</button>
      </div>
    </div>
  );
};

export default PlantillaCard;