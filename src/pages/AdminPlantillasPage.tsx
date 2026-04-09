import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Eye, X } from 'lucide-react';
import { Plantilla } from '../types';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirm } from '../hooks/useConfirm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface AdminPlantillasPageProps {
  onPlantillaClick: (id: number) => void;
}

interface Variable {
  variableid: number;
  nombre: string;
  etiqueta: string;
  descripcion: string | null;
  orden: number;
}

const emptyForm = {
  nombre: '',
  descripcion: '',
  html_content: '',
  css_content: '',
  preview_image: '',
  categoriaid: '',
  usa_bootstrap: true,
  usa_bootstrap_icons: false,
  bootstrap_version: '5.3',
  variables_requeridas: [] as number[],
};

const AdminPlantillasPage: React.FC<AdminPlantillasPageProps> = ({ onPlantillaClick }) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const { confirm, ConfirmModal } = useConfirm();
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plantillasRes, variablesRes] = await Promise.all([
        api.getPlantillas({ activo: undefined }),
        api.getVariables(),
      ]);
      if (plantillasRes.data) setPlantillas(plantillasRes.data.plantillas);
      if (variablesRes.data) setVariables(variablesRes.data.variables);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
      showError('Error al cargar los datos', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setEditingPlantilla(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = async (p: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/plantillas/${p.plantillaid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const plantillaCompleta = data.plantilla;
        
        setEditingPlantilla(p);
        setFormData({
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          html_content: p.html_content,
          css_content: p.css_content || '',
          preview_image: p.preview_image || '',
          categoriaid: p.categoriaid || '',
          usa_bootstrap: p.usa_bootstrap === 1,
          usa_bootstrap_icons: p.usa_bootstrap_icons === 1,
          bootstrap_version: p.bootstrap_version || '5.3',
          variables_requeridas: plantillaCompleta.variables_requeridas?.map((v: any) => v.variableid) || [],
        });
        setModalOpen(true);
      } else {
        showError('Error al cargar las variables de la plantilla', 'Error');
      }
    } catch (err) {
      console.error('Error loading plantilla details:', err);
      showError('Error al cargar los detalles de la plantilla', 'Error');
    }
  };

  const cerrarModal = () => { 
    setModalOpen(false); 
    setEditingPlantilla(null); 
    setError(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleVariableToggle = (variableId: number) => {
    setFormData(prev => {
      const current = prev.variables_requeridas;
      if (current.includes(variableId)) {
        return { ...prev, variables_requeridas: current.filter(id => id !== variableId) };
      } else {
        return { ...prev, variables_requeridas: [...current, variableId] };
      }
    });
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      variables_requeridas: variables.map(v => v.variableid)
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      variables_requeridas: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    const url = editingPlantilla
      ? `${API_BASE_URL}/api/plantillas/${editingPlantilla.plantillaid}`
      : `${API_BASE_URL}/api/plantillas`;

    try {
      const res = await fetch(url, {
        method: editingPlantilla ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        showSuccess(editingPlantilla ? 'Plantilla actualizada correctamente' : 'Plantilla creada correctamente', 'Éxito');
        cerrarModal(); 
        loadData(); 
      } else {
        setError(data.error || 'Error al guardar plantilla');
        showError(data.error || 'Error al guardar plantilla', 'Error');
        if (data.variables_faltantes) {
          showError(`Variables faltantes: ${data.variables_faltantes.join(', ')}`, 'Error');
        }
      }
    } catch (err) {
      console.error('Error saving plantilla:', err);
      setError('Error de conexión');
      showError('Error de conexión', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    const confirmed = await confirm({
      title: 'Eliminar plantilla',
      message: `¿Eliminar la plantilla "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger',
    });

    if (!confirmed) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/plantillas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess(`Plantilla "${nombre}" eliminada correctamente`, 'Eliminada');
        loadData();
      } else {
        showError('Error al eliminar la plantilla', 'Error');
      }
    } catch (err) {
      console.error('Error deleting plantilla:', err);
      showError('Error de conexión', 'Error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Administrar Plantillas</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-refresh" onClick={loadData}>
              <RefreshCw size={16} /> Actualizar
            </button>
            <button className="btn-primary" onClick={abrirCrear}>
              <Plus size={16} /> Crear Plantilla
            </button>
          </div>
        </div>

        {error && !modalOpen && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {plantillas.length === 0 ? (
          <div className="perfil-section" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No hay plantillas registradas</p>
          </div>
        ) : (
          <div className="plantillas-grid">
            {plantillas.map(p => (
              <div key={p.plantillaid} className="plantilla-card admin-card">
                <div className="plantilla-card-header">
                  <h3 style={{ color: 'var(--text-primary)' }}>{p.nombre}</h3>
                  <span className={`status-badge ${p.activo ? 'active' : 'inactive'}`}>
                    {p.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="plantilla-card-body">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {p.descripcion || 'Sin descripción'}
                  </p>
                  <div className="plantilla-stats">
                    <span>📐 {p.total_variables} variables</span>
                    <span>👁️ {p.visitas} visitas</span>
                  </div>
                </div>
                <div className="plantilla-card-footer">
                  <button className="btn-small" onClick={() => onPlantillaClick(p.plantillaid)} title="Ver">
                    <Eye size={13} />
                  </button>
                  <button className="btn-small" onClick={() => abrirEditar(p)} title="Editar">
                    <Edit2 size={13} /> Editar
                  </button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(p.plantillaid, p.nombre)} title="Eliminar">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {modalOpen && (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
          <div className="modal-content" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h2>{editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre <span className="required">*</span></label>
                    <input
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      placeholder="Nombre de la plantilla"
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría ID</label>
                    <input
                      value={formData.categoriaid}
                      onChange={e => setFormData({ ...formData, categoriaid: e.target.value })}
                      placeholder="ID de categoría"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={2}
                    placeholder="Descripción breve"
                  />
                </div>

                <div className="form-group">
                  <label>HTML Content <span className="required">*</span></label>
                  <textarea
                    value={formData.html_content}
                    onChange={e => setFormData({ ...formData, html_content: e.target.value })}
                    rows={8}
                    required
                    placeholder="Usa $_nombre_$ para las variables"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label>CSS Content</label>
                  <textarea
                    value={formData.css_content}
                    onChange={e => setFormData({ ...formData, css_content: e.target.value })}
                    rows={4}
                    placeholder="CSS personalizado (opcional)"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>URL Imagen Preview</label>
                    <input
                      value={formData.preview_image}
                      onChange={e => setFormData({ ...formData, preview_image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Bootstrap Version</label>
                    <input
                      value={formData.bootstrap_version}
                      onChange={e => setFormData({ ...formData, bootstrap_version: e.target.value })}
                      placeholder="5.3"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ alignItems: 'center' }}>
                  <div className="form-group">
                    <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.usa_bootstrap}
                        onChange={e => setFormData({ ...formData, usa_bootstrap: e.target.checked })}
                        style={{ width: 'auto', accentColor: 'var(--primary)' }}
                      />
                      Usar Bootstrap
                    </label>
                  </div>
                  <div className="form-group">
                    <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.usa_bootstrap_icons}
                        onChange={e => setFormData({ ...formData, usa_bootstrap_icons: e.target.checked })}
                        style={{ width: 'auto', accentColor: 'var(--primary)' }}
                      />
                      Bootstrap Icons
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Variables Requeridas</label>
                  <div style={{ 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Seleccionar todas
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Deseleccionar todas
                      </button>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginLeft: 'auto',
                        alignSelf: 'center'
                      }}>
                        {formData.variables_requeridas.length} / {variables.length} seleccionadas
                      </span>
                    </div>
                    <div style={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      padding: '0.5rem'
                    }}>
                      {variables.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                          No hay variables disponibles
                        </p>
                      ) : (
                        variables.map(variable => (
                          <label
                            key={variable.variableid}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.variables_requeridas.includes(variable.variableid)}
                              onChange={() => handleVariableToggle(variable.variableid)}
                              style={{
                                width: '18px',
                                height: '18px',
                                marginTop: '2px',
                                cursor: 'pointer',
                                accentColor: 'var(--primary)'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: 500, 
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem'
                              }}>
                                {variable.etiqueta}
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginLeft: '0.5rem',
                                  fontFamily: 'monospace'
                                }}>
                                  ($_{variable.nombre}_$)
                                </span>
                              </div>
                              {variable.descripcion && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-secondary)',
                                  marginTop: '2px'
                                }}>
                                  {variable.descripcion}
                                </div>
                              )}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <span className="form-help">
                    Selecciona las variables que son requeridas en esta plantilla
                  </span>
                </div>

                {error && (
                  <div className="error-message" style={{ marginTop: '1rem' }}>
                    {error}
                  </div>
                )}

                <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : (editingPlantilla ? 'Actualizar' : 'Crear')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal />
    </div>
  );
};

export default AdminPlantillasPage;