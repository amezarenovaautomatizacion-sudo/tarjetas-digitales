import React, { useState, useEffect } from 'react';
import { Plantilla, PlantillaDetalle } from '../types';
import { tarjetaService } from '../services/tarjeta.service';
import { api } from '../services/api';

interface CrearTarjetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantillas: Plantilla[];
  onSuccess: () => void;
}

const CrearTarjetaModal: React.FC<CrearTarjetaModalProps> = ({ isOpen, onClose, plantillas, onSuccess }) => {
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
      detalle.variables_requeridas.forEach(v => {
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
    if (plantillaid) {
      generatePreview(parseInt(plantillaid), newDatos);
    }
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
        datos
      });

      if (response.error) {
        setError(response.error);
      } else {
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (err) {
      setError('Error al crear la tarjeta');
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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>Crear Nueva Tarjeta</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body modal-split">
          <div className="modal-form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plantilla</label>
                <select
                  value={plantillaid}
                  onChange={(e) => setPlantillaid(e.target.value)}
                  required
                  className="form-control"
                >
                  <option value="">Selecciona una plantilla</option>
                  {plantillas.map(p => (
                    <option key={p.plantillaid} value={p.plantillaid}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nombre de la Tarjeta</label>
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
                  <option value="privado">Privado - Solo visible para mí</option>
                  <option value="publico">Público - Visible para todos</option>
                </select>
              </div>

              {plantillaDetalle && (
                <div className="variables-section">
                  <h3>Campos de la Plantilla</h3>
                  <p className="section-description">Completa todos los campos para personalizar tu tarjeta</p>
                  {plantillaDetalle.variables_requeridas.map(variable => (
                    <div key={variable.variableid} className="form-group">
                      <label>
                        {variable.etiqueta}
                        {variable.es_requerida === 1 && <span className="required">*</span>}
                        {variable.es_requerida === 0 && <span className="optional"> (Opcional)</span>}
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
                          {variable.opciones?.split(',').map(opt => (
                            <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : variable.tipo_dato === 'color' ? (
                        <input
                          type="color"
                          value={datos[variable.nombre] || '#0DB8D3'}
                          onChange={(e) => handleDataChange(variable.nombre, e.target.value)}
                          className="form-control color-input"
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

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary btn-block" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Tarjeta'}
              </button>
            </form>
          </div>

          <div className="modal-preview-section">
            <div className="preview-header">
              <h3>Vista Previa en Vivo</h3>
              {generatingPreview && <div className="preview-loading">Actualizando...</div>}
            </div>
            <div className="preview-content">
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
  );
};

export default CrearTarjetaModal;