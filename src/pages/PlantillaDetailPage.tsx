import React, { useState, useEffect } from 'react';
import { usePlantillaDetalle, usePreview } from '../hooks/usePlantillas';
import { tarjetaService } from '../services/tarjeta.service';
import LoadingSpinner from '../components/LoadingSpinner';

interface PlantillaDetailPageProps {
  plantillaId?: number;
  onBack: () => void;
  tarjetaId?: number;
  existingData?: Record<string, string>;
  existingNombre?: string;
  existingVisibilidad?: string;
}

const PlantillaDetailPage: React.FC<PlantillaDetailPageProps> = ({ 
  plantillaId: propPlantillaId, 
  onBack, 
  tarjetaId,
  existingData,
  existingNombre,
  existingVisibilidad 
}) => {
  const plantillaId = propPlantillaId || 0;
  
  const { plantilla, loading } = usePlantillaDetalle(plantillaId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [visibilidad, setVisibilidad] = useState('privado');
  const [isEditing, setIsEditing] = useState(!!tarjetaId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const { preview, loading: previewLoading, error: previewError, generatePreview } = usePreview();

  // Inicializar con datos existentes
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
  }, [existingData, existingNombre, existingVisibilidad]);

  // Cargar datos de la plantilla y generar preview inicial
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
    } else {
      setSaveSuccess('Tarjeta actualizada correctamente');
      setTimeout(() => {
        onBack();
      }, 1500);
    }
    setSaving(false);
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
        
        <div className="split-layout">
          <div className="form-side">
            <div className="form-card">
              <h3>{isEditing ? 'Editar tu tarjeta' : 'Personaliza tu tarjeta'}</h3>
              <p className="section-description">
                {isEditing 
                  ? 'Modifica los campos y actualiza tu tarjeta digital' 
                  : 'Completa todos los campos para crear tu tarjeta digital'}
              </p>
              
              {isEditing && (
                <div className="edit-info">
                  <div className="form-group">
                    <label>Nombre de la Tarjeta</label>
                    <input
                      type="text"
                      value={nombreTarjeta}
                      onChange={(e) => setNombreTarjeta(e.target.value)}
                      placeholder="Ej: Mi Tarjeta Personal"
                    />
                  </div>
                  <div className="form-group">
                    <label>Visibilidad</label>
                    <select
                      value={visibilidad}
                      onChange={(e) => setVisibilidad(e.target.value)}
                    >
                      <option value="privado">Privado - Solo visible para mí</option>
                      <option value="publico">Público - Visible para todos</option>
                    </select>
                  </div>
                  <div className="form-divider">Contenido de la tarjeta</div>
                </div>
              )}
              
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
              
              {saveError && <div className="error-message">{saveError}</div>}
              {saveSuccess && <div className="success-message">{saveSuccess}</div>}
              
              {isEditing && (
                <div className="form-actions">
                  <button 
                    className="btn-primary" 
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={onBack}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
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