import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { adminService } from '../services/admin.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirm } from '../hooks/useConfirm';

interface Categoria {
  categoriaid: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: number;
  total_plantillas: number;
}

const emptyForm = { nombre: '', descripcion: '', orden: 0, activo: 1 };

const AdminCategoriasPage: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const { confirm, ConfirmModal } = useConfirm();
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editando, setEditando]       = useState<Categoria | null>(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const overlayRef                    = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarCategorias(); }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    const res = await adminService.getCategorias();
    if (res.data) setCategorias(res.data.categorias);
    setLoading(false);
  };

  const abrirCrear = () => {
    setEditando(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = (c: Categoria) => {
    setEditando(c);
    setFormData({ nombre: c.nombre, descripcion: c.descripcion || '', orden: c.orden, activo: c.activo });
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setEditando(null); };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      showError('El nombre es obligatorio', 'Error');
      return;
    }
    setSaving(true);
    const res = editando
      ? await adminService.updateCategoria(editando.categoriaid, formData)
      : await adminService.createCategoria(formData);
    if (res.data) {
      showSuccess(editando ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente', 'Éxito');
      cerrarModal();
      cargarCategorias();
    } else {
      showError(res.error || 'Error al guardar', 'Error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, nombre: string, tienePlantillas: number) => {
    if (tienePlantillas > 0) {
      showError(`No se puede eliminar: tiene ${tienePlantillas} plantilla(s) asociada(s)`, 'Error');
      return;
    }

    const confirmed = await confirm({
      title: 'Eliminar categoría',
      message: `¿Eliminar la categoría "${nombre}"?`,
      confirmText: 'Eliminar',
      type: 'danger',
    });

    if (!confirmed) return;

    const res = await adminService.deleteCategoria(id);
    if (res.data) {
      showSuccess(`Categoría "${nombre}" eliminada correctamente`, 'Eliminada');
      cargarCategorias();
    } else {
      showError(res.error || 'Error al eliminar', 'Error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Gestión de Categorías</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-refresh" onClick={cargarCategorias}>
              <RefreshCw size={16} /> Actualizar
            </button>
            <button className="btn-primary" onClick={abrirCrear}>
              <Plus size={16} /> Crear Categoría
            </button>
          </div>
        </div>

        <div className="perfil-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="suscripciones-table-container">
            <table className="suscripciones-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th className="hide-mobile">Descripción</th>
                  <th>Plantillas</th>
                  <th className="hide-mobile">Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr><td colSpan={7} className="no-data">No hay categorías registradas</td></tr>
                ) : (
                  categorias.map(c => (
                    <tr key={c.categoriaid}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.categoriaid}</td>
                      <td><strong>{c.nombre}</strong></td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {c.descripcion || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{
                          background: 'rgba(13,184,211,0.12)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}>
                          {c.total_plantillas}
                        </span>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{c.orden}</td>
                      <td>
                        {c.activo === 1
                          ? <span className="estado-badge activa">Activo</span>
                          : <span className="estado-badge cancelada">Inactivo</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button className="btn-small" onClick={() => abrirEditar(c)} title="Editar">
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDelete(c.categoriaid, c.nombre, c.total_plantillas)}
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {modalOpen && (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
          <div className="modal-content modal-small" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Empresas"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.activo === 1}
                      onChange={e => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
                      style={{ width: 'auto', accentColor: 'var(--primary)' }}
                    />
                    Activo
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal />
    </div>
  );
};

export default AdminCategoriasPage;