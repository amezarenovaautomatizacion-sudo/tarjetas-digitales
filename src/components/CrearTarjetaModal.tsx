import React, { useState, useEffect } from 'react';
import { Plantilla, PlantillaDetalle } from '../types';
import { tarjetaService } from '../services/tarjeta.service';
import { api } from '../services/api';
import { X, Eye, Save } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface CrearTarjetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantillas: Plantilla[];
  onSuccess: () => void;
}

const CrearTarjetaModal: React.FC<CrearTarjetaModalProps> = ({
  isOpen,
  onClose,
  plantillas,
  onSuccess,
}) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [plantillaid, setPlantillaid] = useState('');
  const [nombre_tarjeta, setNombreTarjeta] = useState('');
  const [visibilidad, setVisibilidad] = useState('privado');
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plantillaDetalle, setPlantillaDetalle] = useState<PlantillaDetalle | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewCss, setPreviewCss] = useState('');
  const [generatingPreview, setGeneratingPreview] = useState(false);

  useEffect(() => {
    if (plantillaid) {
      loadPlantillaDetalle(parseInt(plantillaid));
    } else {
      setPlantillaDetalle(null);
      setPreviewHtml('');
      setPreviewCss('');
      setDatos({});
    }
  }, [plantillaid]);

  const loadPlantillaDetalle = async (id: number) => {
    const response = await api.getPlantillaById(id);
    if (response.data?.plantilla) {
      const detalle = response.data.plantilla;
      setPlantillaDetalle(detalle);
      const initialData: Record<string, string> = {};
      detalle.variables_requeridas.forEach((v) => {
        initialData[v.nombre] = v.ejemplo || '';
      });
      setDatos(initialData);
      generatePreview(id, initialData);
    }
  };

  const generatePreview = async (id: number, data: Record<string, string>) => {
    setGeneratingPreview(true);
    const response = await api.getPreview(id, data);
    if (response.data) {
      setPreviewHtml(response.data.html_preview);
      setPreviewCss(response.data.css_preview);
    }
    setGeneratingPreview(false);
  };

  const handleDataChange = (nombre: string, valor: string) => {
    const newDatos = { ...datos, [nombre]: valor };
    setDatos(newDatos);
    if (plantillaid) generatePreview(parseInt(plantillaid), newDatos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await tarjetaService.crear({
        plantillaid: parseInt(plantillaid),
        nombre_tarjeta,
        visibilidad,
        datos,
      });
      if (response.error) {
        setError(response.error);
        showError(response.error, 'Error');
      } else {
        showSuccess('Tarjeta creada exitosamente', 'Éxito');
        onSuccess();
        onClose();
        resetForm();
      }
    } catch {
      setError('Error al crear la tarjeta');
      showError('Error al crear la tarjeta', 'Error');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setPlantillaid('');
    setNombreTarjeta('');
    setVisibilidad('privado');
    setDatos({});
    setPlantillaDetalle(null);
    setPreviewHtml('');
    setPreviewCss('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        <div className="modal-header">
          <h2>Crear Nueva Tarjeta</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-split" style={{ flex: 1, overflow: 'hidden', alignItems: 'stretch' }}>

          <div className="edit-form-panel">
            <div className="edit-form-card">

              <div className="edit-form-header">
                <h3>Datos de la tarjeta</h3>
                <p>Completa el formulario para crear tu nueva tarjeta digital</p>
              </div>

              <div className="edit-form-scroll">
                <form id="crear-tarjeta-form" onSubmit={handleSubmit}>

                  <div className="form-group">
                    <label>Plantilla</label>
                    <select
                      value={plantillaid}
                      onChange={(e) => setPlantillaid(e.target.value)}
                      required
                      className="form-control"
                    >
                      <option value="">Selecciona una plantilla</option>
                      {plantillas.map((p) => (
                        <option key={p.plantillaid} value={p.plantillaid}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nombre de la tarjeta</label>
                    <input
                      type="text"
                      value={nombre_tarjeta}
                      onChange={(e) => setNombreTarjeta(e.target.value)}
                      required
                      className="form-control"
                      placeholder="Ej: Mi Tarjeta Personal"
                    />
                  </div>

                  <div className="form-group">
                    <label>Visibilidad</label>
                    <select
                      value={visibilidad}
                      onChange={(e) => setVisibilidad(e.target.value)}
                      className="form-control"
                    >
                      <option value="privado">Privado — Solo visible para mí</option>
                      <option value="publico">Público — Visible para todos</option>
                    </select>
                  </div>

                  {plantillaDetalle && (
                    <div className="variables-section">
                      <h3>Campos de la plantilla</h3>
                      {plantillaDetalle.variables_requeridas.map((variable) => (
                        <div key={variable.variableid} className="form-group">
                          <label>
                            {variable.etiqueta}
                            {variable.es_requerida === 1 && <span className="required">*</span>}
                            {variable.es_requerida === 0 && (
                              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4, fontSize: '0.8rem' }}>
                                (Opcional)
                              </span>
                            )}
                          </label>

                          {variable.tipo_dato === 'textarea' ? (
                            <textarea
                              value={datos[variable.nombre] || ''}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
                              className="form-control"
                              rows={4}
                            />
                          ) : variable.tipo_dato === 'select' ? (
                            <select
                              value={datos[variable.nombre] || ''}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              className="form-control"
                            >
                              <option value="">Selecciona una opción</option>
                              {variable.opciones?.split(',').map((opt) => (
                                <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                              ))}
                            </select>
                          ) : variable.tipo_dato === 'color' ? (
                            <input
                              type="color"
                              value={datos[variable.nombre] || '#0DB8D3'}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              className="form-control color-input"
                              style={{ height: '44px', padding: '4px 8px', cursor: 'pointer' }}
                            />
                          ) : variable.tipo_dato === 'url' ? (
                            <input
                              type="url"
                              value={datos[variable.nombre] || ''}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              placeholder={variable.ejemplo || 'https://ejemplo.com'}
                              className="form-control"
                            />
                          ) : variable.tipo_dato === 'tel' ? (
                            <input
                              type="tel"
                              value={datos[variable.nombre] || ''}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              placeholder={variable.ejemplo || '123-456-7890'}
                              className="form-control"
                            />
                          ) : (
                            <input
                              type={variable.tipo_dato === 'email' ? 'email' : 'text'}
                              value={datos[variable.nombre] || ''}
                              onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                              placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
                              className="form-control"
                            />
                          )}

                          {variable.descripcion && (
                            <small className="form-help">{variable.descripcion}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div style={{
                      background: 'rgba(220, 38, 38, 0.1)',
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      color: '#f87171',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}>
                      {error}
                    </div>
                  )}

                </form>
              </div>

              <div className="edit-form-actions">
                <button
                  type="submit"
                  form="crear-tarjeta-form"
                  className="btn-save"
                  disabled={loading}
                >
                  <Save size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {loading ? 'Creando...' : 'Crear Tarjeta'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>

          <div className="edit-preview-panel">
            <div className="preview-card">

              <div className="preview-header">
                <h3>
                  <Eye size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Vista Previa en Vivo
                </h3>
                {generatingPreview && (
                  <div className="preview-loading">Actualizando...</div>
                )}
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
                    <p>Selecciona una plantilla y completa los campos para ver la vista previa</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CrearTarjetaModal;