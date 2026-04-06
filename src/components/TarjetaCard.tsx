import React from 'react';
import { Edit3, Trash2, Globe, Lock, Eye, Calendar } from 'lucide-react';

interface TarjetaCardProps {
  tarjeta: any;
  onEdit: () => void;
  onPublicClick: (slug: string) => void;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {tarjeta.nombre_tarjeta}
          </h3>
        </div>
        <span className={`visibility-badge ${isPublic ? 'publico' : 'privado'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isPublic ? <Globe size={10} /> : <Lock size={10} />}
          {isPublic ? 'Pública' : 'Privada'}
        </span>
      </div>

      <div className="tarjeta-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '0.85rem' }}>📄</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Plantilla
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
              {tarjeta.plantilla_nombre}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '0.85rem' }}>🔗</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Slug
            </div>
            <code style={{
              fontSize: '0.72rem',
              color: 'var(--primary-light)',
              background: 'rgba(13,184,211,0.08)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {tarjeta.slug}
            </code>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--spacing-xs)',
          paddingTop: 'var(--spacing-sm)',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
        }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={13} style={{ color: 'var(--primary)' }} />
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              {tarjeta.visitas_visibles ?? tarjeta.visitas ?? 0}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>visitas</span>
          </div>

          {/* Fechas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={10} /> {formatDate(tarjeta.creado)}
            </span>
            {tarjeta.actualizado && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                🔄 {formatDate(tarjeta.actualizado)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="tarjeta-card-footer">
        <button className="btn-small btn-primary" onClick={onEdit}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Edit3 size={13} /> Editar
        </button>

        {isPublic && (
          <button className="btn-small" onClick={() => onPublicClick(tarjeta.slug)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} /> Ver
          </button>
        )}

        <button className="btn-small" onClick={onToggleVisibility}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {isPublic ? <Lock size={13} /> : <Globe size={13} />}
          {isPublic ? 'Privatizar' : 'Publicar'}
        </button>

        <button className="btn-small btn-danger" onClick={onDelete}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default TarjetaCard;