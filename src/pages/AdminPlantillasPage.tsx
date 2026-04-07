import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Eye } from 'lucide-react';
import { Plantilla } from '../types';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface AdminPlantillasPageProps {
  onPlantillaClick: (id: number) => void;
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
  const [plantillas, setPlantillas]           = useState<Plantilla[]>([]);
  const [variables, setVariables]             = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [modalOpen, setModalOpen]             = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<any>(null);
  const [formData, setFormData]               = useState(emptyForm);
  const [saving, setSaving]                   = useState(false);
  const overlayRef                            = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [plantillasRes, variablesRes] = await Promise.all([
      api.getPlantillas({ activo: undefined }),
      api.getVariables(),
    ]);
    if (plantillasRes.data) setPlantillas(plantillasRes.data.plantillas);
    if (variablesRes.data) setVariables(variablesRes.data.variables);
    setLoading(false);
  };

  const abrirCrear = () => {
    setEditingPlantilla(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = (p: any) => {
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
      variables_requeridas: [],
    });
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setEditingPlantilla(null); };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = editingPlantilla
      ? `${API_BASE_URL}/api/plantillas/${editingPlantilla.plantillaid}`
      : `${API_BASE_URL}/api/plantillas`;

    try {
      const res = await fetch(url, {
        method: editingPlantilla ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { cerrarModal(); loadData(); }
      else {
        const err = await res.json();
        alert(err.error || 'Error al guardar plantilla');
      }
    } catch {
      alert('Error de conexión');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta plantilla? Esta acción no se puede deshacer.')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/plantillas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadData();
    else alert('Error al eliminar la plantilla');
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
                  <button className="btn-small btn-danger" onClick={() => handleDelete(p.plantillaid)} title="Eliminar">
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
          <div className="modal-content" style={{ maxWidth: 720 }}>
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
                  <select
                    multiple
                    value={formData.variables_requeridas.map(String)}
                    onChange={e => setFormData({
                      ...formData,
                      variables_requeridas: Array.from(e.target.selectedOptions, o => parseInt(o.value)),
                    })}
                    style={{ minHeight: 100 }}
                  >
                    {variables.map(v => (
                      <option key={v.variableid} value={v.variableid}>
                        {v.etiqueta} ({v.nombre})
                      </option>
                    ))}
                  </select>
                  <span className="form-help">Ctrl + Click para seleccionar múltiples</span>
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
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
    </div>
  );
};

export default AdminPlantillasPage;