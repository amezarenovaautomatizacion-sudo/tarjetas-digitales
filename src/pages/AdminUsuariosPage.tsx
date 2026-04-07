import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, UserCheck, UserX, Edit2, Trash2, Shield, Users } from 'lucide-react';
import { adminService } from '../services/admin.service';
import LoadingSpinner from '../components/LoadingSpinner';

interface Usuario {
  usuarioid: number;
  nombre: string;
  email: string;
  rolid: number;
  activo: number;
  creado: string;
  ultimo_login: string | null;
  tipo_usuario: string;
  rol_nombre?: string;
}

type ModalTipo = 'editar_rol' | 'editar_estado' | 'eliminar';

const ROL_INFO: Record<number, { label: string; color: string }> = {
  1: { label: 'Administrador', color: '#ef4444' },
  2: { label: 'Editor',        color: '#f59e0b' },
  3: { label: 'Visitante',     color: '#6b7280' },
  4: { label: 'Cliente',       color: '#10b981' },
};

const getRolInfo = (rolid: number) => ROL_INFO[rolid] ?? { label: 'Desconocido', color: '#9ca3af' };

const AdminUsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios]   = useState<{ admins: Usuario[]; clientes: Usuario[] }>({ admins: [], clientes: [] });
  const [loading, setLoading]     = useState(true);
  const [filtro, setFiltro]       = useState<'todos' | 'admin' | 'cliente'>('todos');
  const [busqueda, setBusqueda]   = useState('');
  const [modal, setModal]         = useState<{ show: boolean; usuario: Usuario | null; tipo: ModalTipo }>({
    show: false, usuario: null, tipo: 'editar_estado',
  });
  const [nuevoRol, setNuevoRol]   = useState(3);
  const [accionLoading, setAccionLoading] = useState(false);
  const overlayRef                = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    const res = await adminService.getUsuarios();
    if (res.data) {
      setUsuarios({ admins: res.data.admins || [], clientes: res.data.clientes || [] });
    }
    setLoading(false);
  };

  const abrirModal = (usuario: Usuario, tipo: ModalTipo) => {
    setNuevoRol(usuario.rolid);
    setModal({ show: true, usuario, tipo });
  };

  const cerrarModal = () => setModal({ show: false, usuario: null, tipo: 'editar_estado' });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleCambiarRol = async () => {
    if (!modal.usuario) return;
    setAccionLoading(true);
    const res = await adminService.updateUsuarioRol(modal.usuario.usuarioid, nuevoRol, modal.usuario.tipo_usuario);
    if (res.data) { cerrarModal(); cargarUsuarios(); }
    else alert(res.error || 'Error al actualizar rol');
    setAccionLoading(false);
  };

  const handleCambiarEstado = async () => {
    if (!modal.usuario) return;
    setAccionLoading(true);
    const nuevoEstado = modal.usuario.activo === 1 ? 0 : 1;
    const res = await adminService.updateUsuarioEstado(modal.usuario.usuarioid, nuevoEstado, modal.usuario.tipo_usuario);
    if (res.data) { cerrarModal(); cargarUsuarios(); }
    else alert(res.error || 'Error al cambiar estado');
    setAccionLoading(false);
  };

  const handleEliminar = async () => {
    if (!modal.usuario) return;
    if (!confirm(`¿Eliminar permanentemente a ${modal.usuario.nombre}? Esta acción no se puede deshacer.`)) return;
    setAccionLoading(true);
    const res = await adminService.deleteUsuario(modal.usuario.usuarioid, modal.usuario.tipo_usuario);
    if (res.data) { cerrarModal(); cargarUsuarios(); }
    else alert(res.error || 'Error al eliminar usuario');
    setAccionLoading(false);
  };

  const filtrar = (lista: Usuario[]) => {
    if (!busqueda) return lista;
    const q = busqueda.toLowerCase();
    return lista.filter(u =>
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  };

  const adminsFiltrados   = filtrar(usuarios.admins);
  const clientesFiltrados = filtrar(usuarios.clientes);

  if (loading) {
    return <LoadingSpinner />;
  }

  const TablaUsuarios = ({ lista, tipo }: { lista: Usuario[]; tipo: 'admin' | 'cliente' }) => (
    <div className="perfil-section" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: 'var(--spacing-lg) var(--spacing-lg) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {tipo === 'admin' ? <Shield size={18} style={{ color: 'var(--primary-light)' }} /> : <Users size={18} style={{ color: 'var(--primary-light)' }} />}
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-light)' }}>
          {tipo === 'admin' ? 'Administradores' : 'Clientes'} ({lista.length})
        </h2>
      </div>
      <div className="suscripciones-table-container" style={{ marginTop: '1rem' }}>
        <table className="suscripciones-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="hide-mobile">Email</th>
              {tipo === 'admin' && <th className="hide-mobile">Rol</th>}
              <th>Estado</th>
              <th className="hide-mobile">Registro</th>
              <th className="hide-mobile">Último Login</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={tipo === 'admin' ? 7 : 6} className="no-data">
                  No hay {tipo === 'admin' ? 'administradores' : 'clientes'}
                </td>
              </tr>
            ) : (
              lista.map(u => {
                const rol = getRolInfo(u.rolid);
                return (
                  <tr key={u.usuarioid}>
                    <td><strong>{u.nombre}</strong></td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {u.email}
                    </td>
                    {tipo === 'admin' && (
                      <td className="hide-mobile">
                        <span style={{
                          background: `${rol.color}25`,
                          color: rol.color,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}>
                          {rol.label}
                        </span>
                      </td>
                    )}
                    <td>
                      {u.activo === 1
                        ? <span className="estado-badge activa">Activo</span>
                        : <span className="estado-badge vencida">Inactivo</span>}
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(u.creado).toLocaleDateString()}
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString() : <span style={{ color: 'var(--text-muted)' }}>Nunca</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {tipo === 'admin' && (
                          <button className="btn-small" onClick={() => abrirModal(u, 'editar_rol')} title="Cambiar rol">
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button className="btn-small" onClick={() => abrirModal(u, 'editar_estado')} title={u.activo === 1 ? 'Desactivar' : 'Activar'}>
                          {u.activo === 1 ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        {(tipo === 'cliente' || u.rolid !== 1) && (
                          <button
                            className="btn-small btn-danger"
                            onClick={() => abrirModal(u, 'eliminar')}
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const modalTitulo = () => {
    if (!modal.usuario) return '';
    if (modal.tipo === 'editar_rol') return 'Cambiar Rol';
    if (modal.tipo === 'eliminar') return 'Eliminar Usuario';
    return modal.usuario.activo === 1 ? 'Desactivar Usuario' : 'Activar Usuario';
  };

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Gestión de Usuarios</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre o email…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(31,41,55,0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="todos">Todos</option>
              <option value="admin">Administradores</option>
              <option value="cliente">Clientes</option>
            </select>
            <button className="btn-refresh" onClick={cargarUsuarios}>
              <RefreshCw size={16} /> Actualizar
            </button>
          </div>
        </div>

        {(filtro === 'todos' || filtro === 'admin')    && <TablaUsuarios lista={adminsFiltrados}   tipo="admin"   />}
        {(filtro === 'todos' || filtro === 'cliente')  && <TablaUsuarios lista={clientesFiltrados} tipo="cliente" />}

      </div>

      {modal.show && modal.usuario && (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
          <div className="modal-content modal-small" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem' }}>{modalTitulo()}</h2>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>

            <div className="modal-body">
              <div style={{
                background: 'rgba(13,184,211,0.07)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{modal.usuario.nombre}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{modal.usuario.email}</p>
              </div>

              {modal.tipo === 'editar_rol' && (
                <>
                  <div className="form-group">
                    <label>Nuevo Rol</label>
                    <select
                      value={nuevoRol}
                      onChange={e => setNuevoRol(parseInt(e.target.value))}
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Editor</option>
                      <option value={3}>Visitante</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                    <button className="btn-primary" onClick={handleCambiarRol} disabled={accionLoading}>
                      {accionLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </>
              )}

              {modal.tipo === 'editar_estado' && (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {modal.usuario.activo === 1
                      ? 'El usuario perderá acceso a la plataforma.'
                      : 'El usuario recuperará acceso a la plataforma.'}
                  </p>
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                    <button className="btn-primary" onClick={handleCambiarEstado} disabled={accionLoading}>
                      {accionLoading ? 'Procesando...' : (modal.usuario.activo === 1 ? 'Desactivar' : 'Activar')}
                    </button>
                  </div>
                </>
              )}

              {modal.tipo === 'eliminar' && (
                <>
                  <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Esta acción es permanente y no se puede deshacer.
                  </p>
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                    <button
                      style={{ background: 'linear-gradient(135deg,var(--danger),var(--danger-dark))', color: 'white', border: 'none', padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
                      onClick={handleEliminar}
                      disabled={accionLoading}
                    >
                      {accionLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuariosPage;