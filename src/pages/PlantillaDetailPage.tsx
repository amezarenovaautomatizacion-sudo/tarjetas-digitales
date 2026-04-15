import React, { useState, useEffect } from 'react';
import { usePlantillaDetalle, usePreview } from '../hooks/usePlantillas';
import { tarjetaService } from '../services/tarjeta.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageVariableInput from '../components/ImageVariableInput';
import { fixPreviewImages } from '../utils/fixPreviewImages';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirm } from '../hooks/useConfirm';

interface PlantillaDetailPageProps {
  plantillaId?: number;
  onBack: () => void;
  tarjetaId?: number;
  existingData?: Record<string, string>;
  existingNombre?: string;
  existingVisibilidad?: string;
  existingSlug?: string;
}

const PlantillaDetailPage: React.FC<PlantillaDetailPageProps> = ({ 
  plantillaId: propPlantillaId, 
  onBack, 
  tarjetaId,
  existingData,
  existingNombre,
  existingVisibilidad,
  existingSlug
}) => {
  const plantillaId = propPlantillaId || 0;
  
  const { plantilla, loading } = usePlantillaDetalle(plantillaId);
  const { showSuccess, showError } = useNotification();
  const { confirm, ConfirmModal } = useConfirm();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [visibilidad, setVisibilidad] = useState('privado');
  const [slug, setSlug] = useState('');
  const [isEditing, setIsEditing] = useState(!!tarjetaId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const { preview, loading: previewLoading, error: previewError, generatePreview } = usePreview();

  const safePreviewHtml = preview?.html_preview
    ? fixPreviewImages(preview.html_preview)
    : null;

  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    }
    if (existingNombre) {
      setNombreTarjeta(existingNombre);
    }
    if (existingVisibilidad) {
      setVisibilidad(existingVisibilidad);
    }
    if (existingSlug) {
      setSlug(existingSlug);
    }
  }, [existingData, existingNombre, existingVisibilidad, existingSlug]);

  useEffect(() => {
    if (plantilla?.variables_requeridas) {
      const initial: Record<string, string> = {};
      plantilla.variables_requeridas.forEach(v => { 
        if (existingData && existingData[v.nombre]) {
          initial[v.nombre] = existingData[v.nombre];
        } else {
          initial[v.nombre] = v.ejemplo || '';
        }
      });
      setFormData(initial);
      if (plantillaId) {
        generatePreview(plantillaId, initial);
      }
    }
  }, [plantilla, plantillaId]);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('plantilla_preview_modal_seen');
    if (!hasSeenModal && !isEditing) {
      setShowInfoModal(true);
      sessionStorage.setItem('plantilla_preview_modal_seen', 'true');
    }
  }, [isEditing]);

  const handleInputChange = (nombre: string, valor: string) => {
    const newFormData = { ...formData, [nombre]: valor };
    setFormData(newFormData);
    if (plantillaId) {
      generatePreview(plantillaId, newFormData);
    }
  };

  const handleSaveChanges = async () => {
    if (!tarjetaId) return;
    
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    const response = await tarjetaService.actualizar(tarjetaId, {
      nombre_tarjeta: nombreTarjeta,
      visibilidad: visibilidad,
      datos: formData
    });
    
    if (response.error) {
      setSaveError(response.error);
      showError(response.error, 'Error');
    } else {
      setSaveSuccess('Tarjeta actualizada correctamente');
      showSuccess('Tarjeta actualizada correctamente', 'Guardado');
      setTimeout(() => {
        onBack();
      }, 1500);
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Cancelar edición',
      message: '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.',
      confirmText: 'Sí, cancelar',
      type: 'warning',
    });

    if (confirmed) {
      onBack();
    }
  };

  const getPublicUrl = () => {
    if (slug && visibilidad === 'publico') {
      return `${window.location.origin}/tarjeta/${slug}`;
    }
    return null;
  };

  const renderVariableInput = (variable: any) => {
    const isImage = variable.nombre.toLowerCase().includes('img');
    
    if (isImage) {
      return (
        <ImageVariableInput
          key={variable.variableid}
          variable={variable}
          value={formData[variable.nombre] || ''}
          onChange={handleInputChange}
        />
      );
    }

    const value = formData[variable.nombre] || '';
    
    switch (variable.tipo_dato) {
      case 'textarea':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
              rows={4}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'select':
        const options = variable.opciones?.split(',').map((opt: string) => opt.trim()) || [];
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <select
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              className="form-control"
            >
              <option value="">Selecciona una opción</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'color':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={value || '#0DB8D3'}
                onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={value || '#0DB8D3'}
                onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
                placeholder="#RRGGBB"
                className="color-text form-control"
              />
            </div>
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'url':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="url"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || 'https://ejemplo.com'}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'tel':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="tel"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || '123-456-7890'}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'email':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="email"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || 'correo@ejemplo.com'}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'number':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || '0'}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      case 'date':
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
      default:
        return (
          <div key={variable.variableid} className="form-group">
            <label>{variable.etiqueta}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
              placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
              className="form-control"
            />
            {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
          </div>
        );
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!plantilla) return (
    <div className="error-container">
      <h2>Plantilla no encontrada</h2>
      <button className="btn-back" onClick={onBack}>Volver</button>
    </div>
  );

  const requiredVariables = plantilla.variables_requeridas.filter(v => v.es_requerida === 1);
  const optionalVariables = plantilla.variables_requeridas.filter(v => v.es_requerida === 0);

  return (
    <>
      <div className="plantilla-detail-page">
        <div className="container">
          <button className="btn-back" onClick={onBack}>← Volver</button>
          
          <div className="detail-header">
            <h1>{isEditing ? `Editando: ${nombreTarjeta}` : plantilla.nombre}</h1>
            {plantilla.categoria_nombre && (
              <span className="category-badge">{plantilla.categoria_nombre}</span>
            )}
            <p className="detail-description">{plantilla.descripcion || 'Sin descripción'}</p>
            <div className="detail-stats">
              <span>📊 {plantilla.total_variables} campos totales</span>
              <span>⭐ {requiredVariables.length} campos requeridos</span>
              <span>📝 {optionalVariables.length} campos opcionales</span>
              <span>👁️ {plantilla.visitas} visitas</span>
              <span>📅 {new Date(plantilla.creado).toLocaleDateString('es-MX')}</span>
            </div>
          </div>
          
          <div className="edit-split-layout">
            <div className="edit-form-panel">
              <div className="edit-form-card">
                <div className="edit-form-header">
                  <h3>✏️ {isEditing ? 'Editar información' : 'Personaliza tu tarjeta'}</h3>
                  <p>{isEditing ? 'Modifica los campos para actualizar tu tarjeta' : 'Completa los campos para crear tu tarjeta digital'}</p>
                </div>
                
                <div className="edit-form-scroll">
                  {isEditing && (
                    <div className="edit-info">
                      <div className="form-group">
                        <label>📝 Nombre de la Tarjeta</label>
                        <input
                          type="text"
                          value={nombreTarjeta}
                          onChange={(e) => setNombreTarjeta(e.target.value)}
                          placeholder="Ej: Mi Tarjeta Personal"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>🌍 Visibilidad</label>
                        <select
                          value={visibilidad}
                          onChange={(e) => setVisibilidad(e.target.value)}
                          className="form-control"
                        >
                          <option value="privado">🔒 Privado - Solo visible para mí</option>
                          <option value="publico">🌍 Público - Visible para todos</option>
                        </select>
                        <small className="form-help">
                          {visibilidad === 'publico' 
                            ? 'Tu tarjeta será visible para cualquier persona con el enlace' 
                            : 'Solo tú podrás ver esta tarjeta'}
                        </small>
                        {visibilidad === 'publico' && slug && (
                          <div className="public-url-info">
                            <span>🔗 URL pública: </span>
                            <code>{getPublicUrl()}</code>
                            <button 
                              className="btn-copy-url"
                              onClick={() => {
                                navigator.clipboard.writeText(getPublicUrl()!);
                                showSuccess('URL copiada al portapapeles', 'Copiado');
                              }}
                            >
                              📋 Copiar
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="form-divider">🎨 Contenido de la tarjeta</div>
                    </div>
                  )}
                  
                  {requiredVariables.length > 0 && (
                    <div className="variables-group">
                      <h4>
                        <span className="required-icon">⚠️</span> 
                        Campos Requeridos 
                        <span className="required-badge">Obligatorios</span>
                      </h4>
                      {requiredVariables.map(variable => renderVariableInput(variable))}
                    </div>
                  )}
                  
                  {optionalVariables.length > 0 && (
                    <div className="variables-group">
                      <h4>
                        <span className="optional-icon">✨</span> 
                        Campos Opcionales 
                        <span className="optional-badge">Mejora tu tarjeta</span>
                      </h4>
                      <p className="group-description">Estos campos son opcionales pero ayudan a enriquecer tu tarjeta</p>
                      {optionalVariables.map(variable => renderVariableInput(variable))}
                    </div>
                  )}
                </div>
                
                {saveError && <div className="error-message" style={{ margin: '1rem' }}>{saveError}</div>}
                {saveSuccess && <div className="success-message" style={{ margin: '1rem' }}>{saveSuccess}</div>}
                
                <div className="edit-form-actions">
                  {isEditing ? (
                    <>
                      <button 
                        className="btn-save" 
                        onClick={handleSaveChanges}
                        disabled={saving}
                      >
                        {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-save" 
                      onClick={onBack}
                    >
                      Comenzar a usar
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="edit-preview-panel">
              <div className="preview-card">
                <div className="preview-header">
                  <h3>👁️ Vista Previa en Vivo</h3>
                  <div className="preview-header-actions">
                    {previewLoading && <span className="preview-loading">Actualizando...</span>}
                    {safePreviewHtml && (
                      <button 
                        className="btn-fullscreen"
                        onClick={() => setShowFullscreenModal(true)}
                        title="Ver en pantalla completa"
                      >
                        🖥️ Pantalla Completa
                      </button>
                    )}
                  </div>
                </div>
                <div className="preview-scroll">
                  {previewError && (
                    <div className="error-message">{previewError}</div>
                  )}
                  {safePreviewHtml ? (
                    <div className="preview-render">
                      <style dangerouslySetInnerHTML={{ __html: preview!.css_preview }} />
                      <div dangerouslySetInnerHTML={{ __html: safePreviewHtml }} />
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <span>🎴</span>
                      <p>Completa los campos para ver la vista previa en tiempo real</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal informativo para vista de prueba */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, rgba(13, 184, 211, 0.15), rgba(27, 127, 220, 0.1))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🎨
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Vista de Prueba</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Simulación de creación de tarjeta digital
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowInfoModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(13, 184, 211, 0.08), rgba(27, 127, 220, 0.05))',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(13, 184, 211, 0.2)'
              }}>
                <p style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>🔍 Esta es una vista previa</strong> — Los datos que ingreses aquí son <strong style={{ color: 'var(--warning)' }}>solo para prueba</strong> y no se guardarán.
                </p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Te permite ver cómo se verían tus datos antes de crear una tarjeta real.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '20px' }}>🚀</span>
                  <h4 style={{ margin: 0, color: 'var(--primary-light)' }}>¿Quieres crear tu propia plantilla?</h4>
                </div>
                
                <div style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { step: '1', icon: '🔐', text: 'Iniciar sesión en tu cuenta', color: 'var(--primary)' },
                      { step: '2', icon: '📁', text: 'Ir a la pestaña "Crear Plantillas" del sitio', color: 'var(--primary-light)' },
                      { step: '3', icon: '✏️', text: 'Diseña tu propia plantilla con los campos que necesites', color: 'var(--success)' },
                      { step: '4', icon: '💳', text: 'Las plantillas personalizadas están disponibles en planes de pago', color: 'var(--warning)' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: `rgba(13, 184, 211, 0.15)`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: item.color,
                          flexShrink: 0
                        }}>
                          {item.step}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '16px' }}>{item.icon}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(245, 158, 11, 0.08)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <span style={{ fontSize: '24px' }}>💡</span>
                <span style={{ color: 'var(--warning)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Los datos que ingreses aquí son solo para prueba y no se guardarán al salir
                </span>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowInfoModal(false)}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Cerrar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => setShowInfoModal(false)}
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Entendido, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pantalla completa para vista previa */}
      {showFullscreenModal && safePreviewHtml && (
        <div className="fullscreen-modal-overlay" onClick={() => setShowFullscreenModal(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-modal-header">
              <h2>Vista Previa - {isEditing ? nombreTarjeta : plantilla.nombre}</h2>
              <button className="modal-close-btn" onClick={() => setShowFullscreenModal(false)}>✕</button>
            </div>
            <div className="fullscreen-modal-body">
              <div className="fullscreen-preview">
                <style dangerouslySetInnerHTML={{ __html: preview!.css_preview }} />
                <div dangerouslySetInnerHTML={{ __html: safePreviewHtml }} />
              </div>
            </div>
            <div className="fullscreen-modal-footer">
              {isEditing && (
                <button 
                  className="btn-modal-save" 
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              )}
              <button 
                className="btn-modal-close" 
                onClick={() => setShowFullscreenModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal />
    </>
  );
};

export default PlantillaDetailPage;