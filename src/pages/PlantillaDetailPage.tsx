import React, { useState, useEffect } from 'react';
import { usePlantillaDetalle, usePreview } from '../hooks/usePlantillas';
import LoadingSpinner from '../components/LoadingSpinner';

interface PlantillaDetailPageProps {
  plantillaId: number;
  onBack: () => void;
}

const PlantillaDetailPage: React.FC<PlantillaDetailPageProps> = ({ plantillaId, onBack }) => {
  const { plantilla, loading } = usePlantillaDetalle(plantillaId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { preview, loading: previewLoading, error: previewError, generatePreview } = usePreview();

  useEffect(() => {
    if (plantilla?.variables_requeridas) {
      const initial: Record<string, string> = {};
      plantilla.variables_requeridas.forEach(v => { 
        initial[v.nombre] = v.ejemplo || ''; 
      });
      setFormData(initial);
      if (plantillaId) {
        generatePreview(plantillaId, initial);
      }
    }
  }, [plantilla, plantillaId]);

  const handleInputChange = (nombre: string, valor: string) => {
    const newFormData = { ...formData, [nombre]: valor };
    setFormData(newFormData);
    generatePreview(plantillaId, newFormData);
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
          />
        );
      case 'select':
        const options = variable.opciones?.split(',').map((opt: string) => opt.trim()) || [];
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
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
              className="color-text"
            />
          </div>
        );
      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || 'https://ejemplo.com'}
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || '123-456-7890'}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || 'correo@ejemplo.com'}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || '0'}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(variable.nombre, e.target.value)}
            placeholder={variable.ejemplo || `Ingresa ${variable.etiqueta.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="plantilla-detail-page">
      <div className="container">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        
        <div className="detail-header">
          <h1>{plantilla.nombre}</h1>
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
        
        <div className="split-layout">
          <div className="form-side">
            <div className="form-card">
              <h3>Personaliza tu tarjeta</h3>
              <p className="section-description">Completa todos los campos para crear tu tarjeta digital</p>
              
              {requiredVariables.length > 0 && (
                <div className="variables-group">
                  <h4>Campos Requeridos <span className="required-badge">Obligatorios</span></h4>
                  {requiredVariables.map(variable => (
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
                  <h4>Campos Opcionales <span className="optional-badge">Mejora tu tarjeta</span></h4>
                  <p className="group-description">Estos campos son opcionales pero ayudan a enriquecer tu tarjeta</p>
                  {optionalVariables.map(variable => (
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
          </div>
          
          <div className="preview-side">
            <div className="preview-card">
              <div className="preview-header">
                <h3>Vista Previa en Vivo</h3>
                {previewLoading && <span className="preview-loading">Actualizando...</span>}
              </div>
              <div className="preview-content">
                {previewError && (
                  <div className="error-message">{previewError}</div>
                )}
                {preview ? (
                  <div className="preview-render">
                    <style dangerouslySetInnerHTML={{ __html: preview.css_preview }} />
                    <div dangerouslySetInnerHTML={{ __html: preview.html_preview }} />
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
  );
};

export default PlantillaDetailPage;