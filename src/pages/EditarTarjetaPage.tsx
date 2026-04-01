import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tarjetaService } from '../services/tarjeta.service';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface TarjetaData {
  tarjetaclienteid: number;
  plantillaid: number;
  plantilla_nombre: string;
  nombre_tarjeta: string;
  slug: string;
  visibilidad: 'publico' | 'privado';
  visitas: number;
  creado: string;
  actualizado?: string;
  datos: Record<string, string> | string;
}

const EditarTarjetaPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tarjeta, setTarjeta] = useState<TarjetaData | null>(null);
  const [plantilla, setPlantilla] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [visibilidad, setVisibilidad] = useState('privado');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewCss, setPreviewCss] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  const getTarjetaId = () => {
    const path = window.location.pathname;
    const match = path.match(/\/editar-tarjeta\/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return null;
  };

  const tarjetaId = getTarjetaId();

  useEffect(() => {
    const loadData = async () => {
      if (!tarjetaId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const tarjetaRes = await tarjetaService.obtener(tarjetaId);
        
        if (tarjetaRes.data) {
          const tarjetaData = tarjetaRes.data as TarjetaData;
          
          setTarjeta(tarjetaData);
          setNombreTarjeta(tarjetaData.nombre_tarjeta);
          setVisibilidad(tarjetaData.visibilidad);
          
          let datosObj: Record<string, string> = {};
          try {
            datosObj = typeof tarjetaData.datos === 'string' 
              ? JSON.parse(tarjetaData.datos) 
              : (tarjetaData.datos || {});
          } catch (e) {
            datosObj = {};
          }
          setFormData(datosObj);
          
          const plantillaRes = await api.getPlantillaById(tarjetaData.plantillaid);
          
          if (plantillaRes.data) {
            setPlantilla(plantillaRes.data.plantilla);
            await generatePreview(tarjetaData.plantillaid, datosObj);
          }
        }
      } catch (error) {
        console.error('[EditarTarjeta] Error en loadData:', error);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [tarjetaId]);

  const generatePreview = async (plantillaId: number, data: Record<string, string>) => {
    setPreviewLoading(true);
    try {
      const response = await api.getPreview(plantillaId, data);
      if (response.data) {
        setPreviewHtml(response.data.html_preview);
        setPreviewCss(response.data.css_preview);
      }
    } catch (error) {
      console.error('[EditarTarjeta] Error generando preview:', error);
    }
    setPreviewLoading(false);
  };

  const handleInputChange = (nombre: string, valor: string) => {
    const newFormData = { ...formData, [nombre]: valor };
    setFormData(newFormData);
    if (tarjeta?.plantillaid) {
      generatePreview(tarjeta.plantillaid, newFormData);
    }
  };

  const handleSave = async () => {
    if (!tarjetaId) return;
    
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    try {
      const response = await tarjetaService.actualizar(tarjetaId, {
        nombre_tarjeta: nombreTarjeta,
        visibilidad: visibilidad,
        datos: formData
      });
      
      if (response.error) {
        setSaveError(response.error);
      } else {
        setSaveSuccess('Tarjeta actualizada correctamente');
        if (response.data) {
          setTarjeta(response.data as TarjetaData);
        }
        setTimeout(() => {
          setSaveSuccess('');
        }, 3000);
      }
    } catch (error) {
      setSaveError('Error al guardar los cambios');
      setTimeout(() => {
        setSaveError('');
      }, 3000);
    }
    
    setSaving(false);
  };

  const getPublicUrl = () => {
    if (tarjeta?.slug && visibilidad === 'publico') {
      return `${window.location.origin}/tarjeta/${tarjeta.slug}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Cargando tarjeta...</p>
      </div>
    );
  }

  if (!tarjeta || !plantilla) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>No se pudo cargar la información de la tarjeta</p>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  const requiredVariables = plantilla.variables_requeridas?.filter((v: any) => v.es_requerida === 1) || [];
  const optionalVariables = plantilla.variables_requeridas?.filter((v: any) => v.es_requerida === 0) || [];

  const renderVariableInput = (variable: any) => {
    const value = formData[variable.nombre] || '';
    
    switch (variable.tipo_dato) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
            rows={4}
            className="form-control"
          />
        );
      case 'select':
        const options = variable.opciones?.split(',').map((opt: string) => opt.trim()) || [];
        return (
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
        );
      case 'color':
        return (
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
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
            className="form-control"
          />
        );
    }
  };

  return (
    <>
      <div className="edit-tarjeta-page">
        <div className="container">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Dashboard
          </button>
          
          <div className="edit-header">
            <h1>Editar Tarjeta</h1>
            <p className="edit-description">Modifica el contenido de tu tarjeta digital en tiempo real</p>
            <div className="edit-badges">
              <span className="badge-info">📄 {plantilla.nombre}</span>
              <span className="badge-info">🆔 ID: {tarjeta.tarjetaclienteid}</span>
              <span className="badge-info">📅 Creada: {new Date(tarjeta.creado).toLocaleDateString('es-MX')}</span>
              {visibilidad === 'publico' && tarjeta.slug && (
                <span className="badge-info badge-public">🌍 Pública - {tarjeta.slug}</span>
              )}
            </div>
          </div>
          
          <div className="edit-split-layout">
            <div className="edit-form-panel">
              <div className="edit-form-card">
                <div className="edit-form-header">
                  <h3>✏️ Editar información</h3>
                  <p>Completa los campos para personalizar tu tarjeta</p>
                </div>
                
                <div className="edit-form-scroll">
                  <div className="edit-info">
                    <div className="form-group">
                      <label>Nombre de la Tarjeta</label>
                      <input
                        type="text"
                        value={nombreTarjeta}
                        onChange={(e) => setNombreTarjeta(e.target.value)}
                        placeholder="Ej: Mi Tarjeta Personal"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Visibilidad</label>
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
                      {visibilidad === 'publico' && tarjeta.slug && (
                        <div className="public-url-info">
                          <span>🔗 URL pública: </span>
                          <code>{getPublicUrl()}</code>
                          <button 
                            className="btn-copy-url"
                            onClick={() => {
                              navigator.clipboard.writeText(getPublicUrl()!);
                              alert('URL copiada al portapapeles');
                            }}
                          >
                            📋 Copiar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="form-divider">🎨 Contenido de la tarjeta</div>
                  </div>
                  
                  {requiredVariables.length > 0 && (
                    <div className="variables-group">
                      <h4>
                        <span className="required-icon">⚠️</span> 
                        Campos Requeridos 
                        <span className="required-badge">Obligatorios</span>
                      </h4>
                      {requiredVariables.map((variable: any) => (
                        <div key={variable.variableid} className="form-group">
                          <label>
                            {variable.etiqueta}
                            <span className="required">*</span>
                          </label>
                          {renderVariableInput(variable)}
                          {variable.descripcion && (
                            <small className="form-help">{variable.descripcion}</small>
                          )}
                        </div>
                      ))}
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
                      {optionalVariables.map((variable: any) => (
                        <div key={variable.variableid} className="form-group">
                          <label>
                            {variable.etiqueta}
                            <span className="optional"> (Opcional)</span>
                          </label>
                          {renderVariableInput(variable)}
                          {variable.descripcion && (
                            <small className="form-help">{variable.descripcion}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {saveError && <div className="error-message">{saveError}</div>}
                {saveSuccess && <div className="success-message">{saveSuccess}</div>}
                
                <div className="edit-form-actions">
                  <button 
                    className="btn-save" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={() => navigate('/dashboard')}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="edit-preview-panel">
              <div className="preview-card">
                <div className="preview-header">
                  <h3>👁️ Vista Previa en Vivo</h3>
                  <div className="preview-header-actions">
                    {previewLoading && <span className="preview-loading">Actualizando...</span>}
                    <button 
                      className="btn-fullscreen"
                      onClick={() => setShowFullscreenModal(true)}
                      title="Ver en pantalla completa"
                    >
                      🖥️ Pantalla Completa
                    </button>
                  </div>
                </div>
                <div className="preview-scroll">
                  {previewHtml ? (
                    <div className="preview-render">
                      <style dangerouslySetInnerHTML={{ __html: previewCss }} />
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <span>🎴</span>
                      <p>Completa los campos para ver la vista previa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFullscreenModal && (
        <div className="fullscreen-modal-overlay" onClick={() => setShowFullscreenModal(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-modal-header">
              <h2>Vista Previa - {nombreTarjeta}</h2>
              <button className="modal-close-btn" onClick={() => setShowFullscreenModal(false)}>✕</button>
            </div>
            <div className="fullscreen-modal-body">
              {previewHtml ? (
                <div className="fullscreen-preview">
                  <style dangerouslySetInnerHTML={{ __html: previewCss }} />
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <div className="preview-placeholder">
                  <span>🎴</span>
                  <p>Completa los campos para ver la vista previa</p>
                </div>
              )}
            </div>
            <div className="fullscreen-modal-footer">
              <button 
                className="btn-modal-save" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
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
    </>
  );
};

export default EditarTarjetaPage;