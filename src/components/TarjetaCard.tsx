import React from 'react';

interface TarjetaCardProps {
  tarjeta: any;
  onEdit: () => void;
  onPublicClick: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onUpdate?: () => void;
}

const TarjetaCard: React.FC<TarjetaCardProps> = ({ 
  tarjeta, onEdit, onPublicClick, onDelete, onToggleVisibility 
}) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-MX');

  return (
    <div className="tarjeta-card">
      <div className="tarjeta-card-header">
        <h3>{tarjeta.nombre_tarjeta}</h3>
        <span className={`visibility-badge ${tarjeta.visibilidad}`}>
          {tarjeta.visibilidad === 'publico' ? '🌍 Pública' : '🔒 Privada'}
        </span>
      </div>
      <div className="tarjeta-card-body">
        <p><strong>Plantilla:</strong> {tarjeta.plantilla_nombre}</p>
        <p><strong>Slug:</strong> {tarjeta.slug}</p>
        <p><strong>Visitas:</strong> {tarjeta.visitas || 0}</p>
        <p><small>Creada: {formatDate(tarjeta.creado)}</small></p>
        {tarjeta.actualizado && (
          <p><small>Actualizada: {formatDate(tarjeta.actualizado)}</small></p>
        )}
      </div>
      <div className="tarjeta-card-footer">
        <button className="btn-small btn-primary" onClick={onEdit}>
          📝 Editar Contenido
        </button>
        {tarjeta.visibilidad === 'publico' && (
          <button className="btn-small" onClick={onPublicClick}>
            🔗 Ver Pública
          </button>
        )}
        <button className="btn-small" onClick={onToggleVisibility}>
          {tarjeta.visibilidad === 'publico' ? '🔒 Hacer Privado' : '🌍 Hacer Público'}
        </button>
        <button className="btn-small btn-danger" onClick={onDelete}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default TarjetaCard;