import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { adminService } from '../services/admin.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

interface Log {
  id: number;
  admin_id: number;
  admin_nombre: string;
  admin_email: string;
  accion: string;
  entidad: string;
  entidad_id: number;
  detalles: string;
  ip_address: string;
  fecha: string;
}

const ACCIONES = [
  { value: '',                      label: 'Todas las acciones' },
  { value: 'cambio_rol',            label: 'Cambio de rol' },
  { value: 'activar_usuario',       label: 'Activar usuario' },
  { value: 'desactivar_usuario',    label: 'Desactivar usuario' },
  { value: 'eliminar_usuario',      label: 'Eliminar usuario' },
  { value: 'crear_variable',        label: 'Crear variable' },
  { value: 'actualizar_variable',   label: 'Actualizar variable' },
  { value: 'eliminar_variable',     label: 'Eliminar variable' },
  { value: 'crear_categoria',       label: 'Crear categoría' },
];

const getAccionStyle = (accion: string): React.CSSProperties => {
  if (accion.includes('crear') || accion.includes('activar'))
    return { background: 'rgba(16,185,129,0.15)', color: '#10b981' };
  if (accion.includes('eliminar') || accion.includes('desactivar'))
    return { background: 'rgba(239,68,68,0.15)', color: '#ef4444' };
  if (accion.includes('actualizar') || accion.includes('cambio'))
    return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
  return { background: 'rgba(13,184,211,0.15)', color: 'var(--primary)' };
};

const AdminLogsPage: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [logs, setLogs]               = useState<Log[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [busqueda, setBusqueda]       = useState('');
  const [pagina, setPagina]           = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => { cargarLogs(); }, [pagina, filtroAccion]);

  const cargarLogs = async () => {
    setLoading(true);
    const res = await adminService.getLogs({ limite: 50, pagina, accion: filtroAccion || undefined });
    if (res.data) {
      let data: Log[] = res.data.logs || [];
      if (busqueda) {
        const q = busqueda.toLowerCase();
        data = data.filter(l =>
          l.admin_nombre?.toLowerCase().includes(q) ||
          l.admin_email?.toLowerCase().includes(q) ||
          l.accion.toLowerCase().includes(q)
        );
      }
      setLogs(data);
      setTotalPaginas(res.data.paginacion?.paginas || 1);
    }
    setLoading(false);
  };

  const handleBusquedaKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') cargarLogs();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Logs de Auditoría</h1>
          <button className="btn-refresh" onClick={cargarLogs}>
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        <div className="filtros" style={{ marginBottom: '1.5rem' }}>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o acción…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyUp={handleBusquedaKey}
            />
          </div>
          <select
            value={filtroAccion}
            onChange={e => { setFiltroAccion(e.target.value); setPagina(1); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(31,41,55,0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {ACCIONES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        <div className="perfil-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="suscripciones-table-container">
            <table className="suscripciones-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Administrador</th>
                  <th className="hide-mobile">Email</th>
                  <th>Acción</th>
                  <th className="hide-mobile">Entidad</th>
                  <th className="hide-mobile">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} className="no-data">No hay logs registrados</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {new Date(log.fecha).toLocaleString()}
                       </td>
                      <td>{log.admin_nombre || <span style={{ color: 'var(--text-muted)' }}>Sistema</span>}</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {log.admin_email || '—'}
                       </td>
                      <td>
                        <span style={{
                          ...getAccionStyle(log.accion),
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}>
                          {log.accion}
                        </span>
                       </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{log.entidad}</td>
                      <td className="hide-mobile">
                        <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {log.ip_address || '—'}
                        </code>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-small"
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              ← Anterior
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              className="btn-small"
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Siguiente →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminLogsPage;