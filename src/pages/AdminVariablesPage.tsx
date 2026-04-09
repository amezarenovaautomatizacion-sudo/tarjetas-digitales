import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { adminService } from '../services/admin.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirm } from '../hooks/useConfirm';

interface Variable {
  variableid: number;
  nombre: string;
  etiqueta: string;
  descripcion: string | null;
  tipo_dato: string;
  ejemplo: string | null;
  es_requerida: number;
  orden: number;
  activo: number;
}

const emptyForm = {
  nombre: '', etiqueta: '', descripcion: '', tipo_dato: 'texto',
  ejemplo: '', es_requerida: 0, orden: 0,
};

const TIPOS = [
  { value: 'texto',    label: 'Texto' },
  { value: 'textarea', label: 'Área de texto' },
  { value: 'email',    label: 'Email' },
  { value: 'tel',      label: 'Teléfono' },
  { value: 'url',      label: 'URL' },
  { value: 'color',    label: 'Color' },
  { value: 'date',     label: 'Fecha' },
  { value: 'number',   label: 'Número' },
];

const AdminVariablesPage: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const { confirm, ConfirmModal } = useConfirm();
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando]   = useState<Variable | null>(null);
  const [formData, setFormData]   = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const overlayRef                = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarVariables(); }, []);

  const cargarVariables = async () => {
    setLoading(true);
    const res = await adminService.getVariablesAdmin();
    if (res.data) setVariables(res.data.variables);
    setLoading(false);
  };

  const abrirCrear = () => {
    setEditando(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = (v: Variable) => {
    setEditando(v);
    setFormData({
      nombre: v.nombre, etiqueta: v.etiqueta, descripcion: v.descripcion || '',
      tipo_dato: v.tipo_dato, ejemplo: v.ejemplo || '',
      es_requerida: v.es_requerida, orden: v.orden,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setEditando(null); };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.etiqueta.trim()) {
      showError('Nombre y etiqueta son obligatorios', 'Error');
      return;
    }
    setSaving(true);
    const res = editando
      ? await adminService.updateVariable(editando.variableid, formData)
      : await adminService.createVariable(formData);
    if (res.data) {
      showSuccess(editando ? 'Variable actualizada correctamente' : 'Variable creada correctamente', 'Éxito');
      cerrarModal();
      cargarVariables();
    } else {
      showError(res.error || 'Error al guardar', 'Error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, nombre: string) => {
    const confirmed = await confirm({
      title: 'Eliminar variable',
      message: `¿Eliminar la variable "${nombre}"? Si está en uso, no se podrá eliminar.`,
      confirmText: 'Eliminar',
      type: 'danger',
    });

    if (!confirmed) return;

    const res = await adminService.deleteVariable(id);
    if (res.data) {
      showSuccess(`Variable "${nombre}" eliminada correctamente`, 'Eliminada');
      cargarVariables();
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
          <h1>Gestión de Variables</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-refresh" onClick={cargarVariables}>
              <RefreshCw size={16} /> Actualizar
            </button>
            <button className="btn-primary" onClick={abrirCrear}>
              <Plus size={16} /> Crear Variable
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
                  <th>Etiqueta</th>
                  <th className="hide-mobile">Tipo</th>
                  <th className="hide-mobile">Req.</th>
                  <th className="hide-mobile">Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {variables.length === 0 ? (
                  <tr><td colSpan={8} className="no-data">No hay variables registradas</td></tr>
                ) : (
                  variables.map(v => (
                    <tr key={v.variableid}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.variableid}</td>
                      <td>
                        <code style={{
                          background: 'rgba(13,184,211,0.1)',
                          color: 'var(--primary-light)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                        }}>
                          {v.nombre}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-light)' }}>{v.etiqueta}</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {v.tipo_dato}
                      </td>
                      <td className="hide-mobile">
                        {v.es_requerida === 1
                          ? <span style={{ color: 'var(--success)' }}>●</span>
                          : <span style={{ color: 'var(--text-muted)' }}>○</span>}
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{v.orden}</td>
                      <td>
                        {v.activo === 1
                          ? <span className="estado-badge activa">Activo</span>
                          : <span className="estado-badge cancelada">Inactivo</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn-small" onClick={() => abrirEditar(v)} title="Editar">
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDelete(v.variableid, v.nombre)}
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
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Variable' : 'Nueva Variable'}</h2>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre <span className="required">*</span></label>
                  <input
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="ej: nombre"
                  />
                </div>
                <div className="form-group">
                  <label>Etiqueta <span className="required">*</span></label>
                  <input
                    value={formData.etiqueta}
                    onChange={e => setFormData({ ...formData, etiqueta: e.target.value })}
                    placeholder="ej: Nombre completo"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de dato</label>
                  <select
                    value={formData.tipo_dato}
                    onChange={e => setFormData({ ...formData, tipo_dato: e.target.value })}
                  >
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ejemplo</label>
                  <input
                    value={formData.ejemplo}
                    onChange={e => setFormData({ ...formData, ejemplo: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.es_requerida === 1}
                      onChange={e => setFormData({ ...formData, es_requerida: e.target.checked ? 1 : 0 })}
                      style={{ width: 'auto', accentColor: 'var(--primary)' }}
                    />
                    Variable requerida
                  </label>
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  />
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

export default AdminVariablesPage;