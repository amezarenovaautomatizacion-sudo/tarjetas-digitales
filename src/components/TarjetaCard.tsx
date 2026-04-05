import React from 'react';
import { Edit3, Trash2, Globe, Lock, Eye, Calendar } from 'lucide-react';

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
  const isPublic = tarjeta.visibilidad === 'publico';

  return (
    <div className="tarjeta-card">
      <div className="tarjeta-card-header">
        <div className="tarjeta-title-section">
          <h3>{tarjeta.nombre_tarjeta}</h3>
          <span className={`visibility-badge ${isPublic ? 'publico' : 'privado'}`}>
            {isPublic ? <Globe size={12} /> : <Lock size={12} />}
            {isPublic ? ' Pública' : ' Privada'}
          </span>
        </div>
      </div>
      <div className="tarjeta-card-body">
        <p><strong>📄 Plantilla:</strong> {tarjeta.plantilla_nombre}</p>
        <p><strong>🔗 Slug:</strong> {tarjeta.slug}</p>
        <p><strong><Eye size={14} /> Visitas:</strong> {tarjeta.visitas || 0}</p>
        <p><small><Calendar size={12} /> Creada: {formatDate(tarjeta.creado)}</small></p>
        {tarjeta.actualizado && (
          <p><small>🔄 Actualizada: {formatDate(tarjeta.actualizado)}</small></p>
        )}
      </div>
      <div className="tarjeta-card-footer">
        <button className="btn-small btn-primary" onClick={onEdit}>
          <Edit3 size={14} /> Editar
        </button>
        {isPublic && (
          <button className="btn-small" onClick={onPublicClick}>
            <Globe size={14} /> Ver Pública
          </button>
        )}
        <button className="btn-small" onClick={onToggleVisibility}>
          {isPublic ? <Lock size={14} /> : <Globe size={14} />}
          {isPublic ? ' Hacer Privado' : ' Hacer Público'}
        </button>
        <button className="btn-small btn-danger" onClick={onDelete}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </div>
  );
};

export default TarjetaCard;