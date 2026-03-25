// src/pages/AdminPlantillasPage.tsx
import React, { useState, useEffect } from 'react';
import { Plantilla } from '../types';
import { api } from '../services/api';
import { authService } from '../services/auth.service';
import LoadingSpinner from '../components/LoadingSpinner';

interface AdminPlantillasPageProps {
  onPlantillaClick: (id: number) => void;
}

const AdminPlantillasPage: React.FC<AdminPlantillasPageProps> = ({ onPlantillaClick }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', html_content: '', css_content: '', 
    preview_image: '', categoriaid: '', usa_bootstrap: true, 
    usa_bootstrap_icons: false, bootstrap_version: '5.3', 
    variables_requeridas: [] as number[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [plantillasRes, variablesRes] = await Promise.all([
      api.getPlantillas({ activo: undefined }),
      api.getVariables()
    ]);
    if (plantillasRes.data) setPlantillas(plantillasRes.data.plantillas);
    if (variablesRes.data) setVariables(variablesRes.data.variables);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingPlantilla 
      ? `https://api-tarjetas.vercel.app/api/plantillas/${editingPlantilla.plantillaid}`
      : 'https://api-tarjetas.vercel.app/api/plantillas';
    
    const response = await fetch(url, {
      method: editingPlantilla ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      setModalOpen(false);
      setEditingPlantilla(null);
      setFormData({ 
        nombre: '', descripcion: '', html_content: '', css_content: '', 
        preview_image: '', categoriaid: '', usa_bootstrap: true, 
        usa_bootstrap_icons: false, bootstrap_version: '5.3', 
        variables_requeridas: [] 
      });
      loadData();
    } else {
      const error = await response.json();
      alert(error.error || 'Error al guardar plantilla');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`https://api-tarjetas.vercel.app/api/plantillas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) loadData();
  };

  const openEditModal = (plantilla: any) => {
    setEditingPlantilla(plantilla);
    setFormData({
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion || '',
      html_content: plantilla.html_content,
      css_content: plantilla.css_content || '',
      preview_image: plantilla.preview_image || '',
      categoriaid: plantilla.categoriaid || '',
      usa_bootstrap: plantilla.usa_bootstrap === 1,
      usa_bootstrap_icons: plantilla.usa_bootstrap_icons === 1,
      bootstrap_version: plantilla.bootstrap_version || '5.3',
      variables_requeridas: []
    });
    setModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Administrar Plantillas</h1>
          <button className="btn-primary" onClick={() => { 
            setEditingPlantilla(null); 
            setFormData({ 
              nombre: '', descripcion: '', html_content: '', css_content: '', 
              preview_image: '', categoriaid: '', usa_bootstrap: true, 
              usa_bootstrap_icons: false, bootstrap_version: '5.3', 
              variables_requeridas: [] 
            }); 
            setModalOpen(true); 
          }}>
            + Crear Plantilla
          </button>
        </div>
        
        <div className="plantillas-grid">
          {plantillas.map(p => (
            <div key={p.plantillaid} className="plantilla-card admin-card">
              <div className="plantilla-card-header" onClick={() => onPlantillaClick(p.plantillaid)}>
                <h3>{p.nombre}</h3>
                <span className={`status-badge ${p.activo ? 'active' : 'inactive'}`}>
                  {p.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="plantilla-card-body" onClick={() => onPlantillaClick(p.plantillaid)}>
                <p>{p.descripcion || 'Sin descripción'}</p>
                <div className="plantilla-stats">
                  <span>📊 {p.total_variables} variables</span>
                  <span>👁️ {p.visitas} visitas</span>
                </div>
              </div>
              <div className="plantilla-card-footer">
                <button className="btn-small" onClick={() => openEditModal(p)}>Editar</button>
                <button className="btn-small btn-danger" onClick={() => handleDelete(p.plantillaid)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <div className="modal-content large">
              <div className="modal-header">
                <h2>{editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre*</label>
                      <input value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Categoría ID</label>
                      <input value={formData.categoriaid} onChange={(e) => setFormData({...formData, categoriaid: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} rows={2} />
                  </div>
                  <div className="form-group">
                    <label>HTML Content*</label>
                    <textarea value={formData.html_content} onChange={(e) => setFormData({...formData, html_content: e.target.value})} rows={8} required placeholder="Usa $_nombre_$ para variables" />
                  </div>
                  <div className="form-group">
                    <label>CSS Content</label>
                    <textarea value={formData.css_content} onChange={(e) => setFormData({...formData, css_content: e.target.value})} rows={4} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>URL Imagen Preview</label>
                      <input value={formData.preview_image} onChange={(e) => setFormData({...formData, preview_image: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Bootstrap Version</label>
                      <input value={formData.bootstrap_version} onChange={(e) => setFormData({...formData, bootstrap_version: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input type="checkbox" checked={formData.usa_bootstrap} onChange={(e) => setFormData({...formData, usa_bootstrap: e.target.checked})} /> 
                        Usar Bootstrap
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input type="checkbox" checked={formData.usa_bootstrap_icons} onChange={(e) => setFormData({...formData, usa_bootstrap_icons: e.target.checked})} /> 
                        Usar Bootstrap Icons
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Variables Requeridas (IDs)</label>
                    <select 
                      multiple 
                      value={formData.variables_requeridas.map(String)} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        variables_requeridas: Array.from(e.target.selectedOptions, opt => parseInt(opt.value))
                      })}
                    >
                      {variables.map(v => (
                        <option key={v.variableid} value={v.variableid}>
                          {v.etiqueta} ({v.nombre})
                        </option>
                      ))}
                    </select>
                    <small>Ctrl+Click para seleccionar múltiples</small>
                  </div>
                  <button type="submit" className="btn-primary">
                    {editingPlantilla ? 'Actualizar' : 'Crear'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlantillasPage;