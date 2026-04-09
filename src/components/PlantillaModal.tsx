import React, { useState, useEffect } from 'react';
import { PlantillaDetalle } from '../types';
import { usePreview } from '../hooks/usePlantillas';
import { useNotification } from '../contexts/NotificationContext';

interface PlantillaModalProps {
  plantilla: PlantillaDetalle | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlantillaModal: React.FC<PlantillaModalProps> = ({ plantilla, isOpen, onClose }) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { preview, loading, error, generatePreview } = usePreview();

  useEffect(() => {
    if (plantilla && plantilla.variables_requeridas) {
      const initialData: Record<string, string> = {};
      plantilla.variables_requeridas.forEach(variable => {
        initialData[variable.nombre] = variable.ejemplo || '';
      });
      setFormData(initialData);
    }
  }, [plantilla]);

  if (!isOpen || !plantilla) return null;

  const handleInputChange = (nombre: string, value: string) => {
    setFormData(prev => ({ ...prev, [nombre]: value }));
  };

  const handlePreview = () => {
    generatePreview(plantilla.plantillaid, formData);
    showInfo('Generando vista previa...', 'Procesando');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{plantilla.nombre}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-section">
            <h3>Descripción</h3>
            <p>{plantilla.descripcion || 'Sin descripción'}</p>
          </div>

          <div className="modal-section">
            <h3>Variables Requeridas</h3>
            <div className="variables-form">
              {plantilla.variables_requeridas.map(variable => (
                <div key={variable.variableid} className="form-group">
                  <label htmlFor={variable.nombre}>
                    {variable.etiqueta}
                    {variable.es_requerida === 1 && <span className="required">*</span>}
                  </label>
                  <input
                    type={variable.tipo_dato === 'email' ? 'email' : 'text'}
                    id={variable.nombre}
                    value={formData[variable.nombre] || ''}
                    onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
                    placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
                  />
                  {variable.descripcion && (
                    <small className="form-help">{variable.descripcion}</small>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <h3>Vista Previa</h3>
            <button 
              className="btn-preview" 
              onClick={handlePreview}
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar Vista Previa'}
            </button>
            
            {error && <div className="error-message">{error}</div>}
            
            {preview && (
              <div className="preview-container">
                <style dangerouslySetInnerHTML={{ __html: preview.css_preview }} />
                <div 
                  dangerouslySetInnerHTML={{ __html: preview.html_preview }}
                  className="preview-html"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantillaModal;