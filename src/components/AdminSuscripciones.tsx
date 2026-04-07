import React, { useState, useEffect, useRef } from 'react';
import { suscripcionService } from '../services/suscripcion.service';
import { Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, UserPlus, Bell } from 'lucide-react';

interface Suscripcion {
  suscripcionid: number;
  usuarioid: number;
  usuario_nombre: string;
  usuario_email: string;
  tipo_usuario: string;
  plan_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  precio_centavos: number;
  automatico_renovar: number;
}

interface Cliente {
  usuarioid: number;
  nombre: string;
  email: string;
}

const emptyModalSuscribir = { show: false, clienteId: 0, clienteNombre: '', clienteEmail: '' };
const emptyModalRenovar   = { show: false, suscripcionid: 0, nombre: '', email: '' };

const getDiasRestantes = (fechaFin: string) => {
  const diff = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86_400_000);
  return diff < 0 ? 0 : diff;
};

const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  switch (estado) {
    case 'activa':    return <span className="estado-badge activa"><CheckCircle size={12} /> Activa</span>;
    case 'vencida':   return <span className="estado-badge vencida"><Clock size={12} /> Vencida</span>;
    case 'cancelada': return <span className="estado-badge cancelada"><XCircle size={12} /> Cancelada</span>;
    default:          return <span className="estado-badge"><AlertCircle size={12} /> {estado}</span>;
  }
};

const AdminSuscripciones: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [clientes, setClientes]           = useState<Cliente[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filtroEstado, setFiltroEstado]   = useState('');
  const [busqueda, setBusqueda]           = useState('');
  const [renovandoId, setRenovandoId]     = useState<number | null>(null);
  const [notificandoId, setNotificandoId] = useState<number | null>(null);
  const [modalSuscribir, setModalSuscribir] = useState(emptyModalSuscribir);
  const [modalRenovar, setModalRenovar]     = useState(emptyModalRenovar);
  const [formSuscripcion, setFormSuscripcion] = useState({
    tiposuscripcionid: 1,
    periodo: 'mensual',
    renovar_automatico: false,
  });

  const overlaySuscribirRef = useRef<HTMLDivElement>(null);
  const overlayRenovarRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarSuscripciones(); cargarClientes(); }, [filtroEstado]);

  const cargarSuscripciones = async () => {
    setLoading(true);
    const res = await suscripcionService.getAllSuscripciones({ estado: filtroEstado || undefined, limite: 100 });
    if (res.data) {
      let data: Suscripcion[] = res.data.suscripciones || [];
      if (busqueda) {
        const q = busqueda.toLowerCase();
        data = data.filter(s =>
          s.usuario_nombre?.toLowerCase().includes(q) ||
          s.usuario_email?.toLowerCase().includes(q)
        );
      }
      setSuscripciones(data);
    }
    setLoading(false);
  };

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app'}/api/admin/clientes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.clientes) setClientes(data.clientes);
    } catch (e) {
      console.error('Error cargando clientes:', e);
    }
  };

  const handleSuscribirCliente = async () => {
    setRenovandoId(-1);
    const dias = formSuscripcion.periodo === 'anual' ? 365 : 30;
    const res = await suscripcionService.crearSuscripcionAdmin(
      modalSuscribir.clienteId,
      formSuscripcion.tiposuscripcionid,
      dias,
      formSuscripcion.renovar_automatico
    );
    if (res.data) {
      setModalSuscribir(emptyModalSuscribir);
      cargarSuscripciones();
    } else {
      alert(res.error || 'Error al crear suscripción');
    }
    setRenovandoId(null);
  };

  const handleRenovar = async () => {
    if (!modalRenovar.suscripcionid) return;
    setRenovandoId(modalRenovar.suscripcionid);
    const res = await suscripcionService.renovarSuscripcionAdmin(modalRenovar.suscripcionid, 30);
    if (res.data) {
      setModalRenovar(emptyModalRenovar);
      cargarSuscripciones();
    } else {
      alert(res.error || 'Error al renovar');
    }
    setRenovandoId(null);
  };

  const handleEnviarNotificacion = async (s: Suscripcion) => {
    setNotificandoId(s.suscripcionid);
    const res = await suscripcionService.enviarNotificacionVencimiento(s.suscripcionid);
    if (!res.data) alert(res.error || 'Error al enviar notificación');
    setNotificandoId(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner-simple">
        <div className="spinner"></div>
        <p>Cargando suscripciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Gestión de Suscripciones</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre o email…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyUp={() => cargarSuscripciones()}
              />
            </div>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(31,41,55,0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="vencida">Vencidas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button className="btn-refresh" onClick={cargarSuscripciones}>
              <RefreshCw size={16} /> Actualizar
            </button>
            <button
              className="btn-primary"
              onClick={() => setModalSuscribir({ show: true, clienteId: 0, clienteNombre: '', clienteEmail: '' })}
            >
              <UserPlus size={16} /> Suscribir Cliente
            </button>
          </div>
        </div>

        <div className="perfil-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="suscripciones-table-container">
            <table className="suscripciones-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th className="hide-mobile">Email</th>
                  <th>Plan</th>
                  <th className="hide-mobile">Inicio</th>
                  <th className="hide-mobile">Fin</th>
                  <th>Días rest.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripciones.length === 0 ? (
                  <tr><td colSpan={8} className="no-data">No hay suscripciones registradas</td></tr>
                ) : (
                  suscripciones.map(s => {
                    const dias       = getDiasRestantes(s.fecha_fin);
                    const esCercana  = dias > 0 && dias <= 7 && s.estado === 'activa';
                    return (
                      <tr key={s.suscripcionid}>
                        <td><strong>{s.usuario_nombre || '—'}</strong></td>
                        <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {s.usuario_email}
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
                            {s.plan_nombre}
                          </span>
                        </td>
                        <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {new Date(s.fecha_inicio).toLocaleDateString()}
                        </td>
                        <td className="hide-mobile" style={{ color: esCercana ? 'var(--warning)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {new Date(s.fecha_fin).toLocaleDateString()}
                          {esCercana && ' ⚠️'}
                        </td>
                        <td className={dias <= 7 && s.estado === 'activa' ? 'urgente' : ''}>
                          {dias} días
                        </td>
                        <td><EstadoBadge estado={s.estado} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn-renovar"
                              onClick={() => setModalRenovar({ show: true, suscripcionid: s.suscripcionid, nombre: s.usuario_nombre || s.usuario_email, email: s.usuario_email })}
                              disabled={s.estado !== 'activa' && s.estado !== 'vencida'}
                            >
                              <RefreshCw size={13} /> Renovar
                            </button>
                            {s.estado === 'activa' && (
                              <button
                                className="btn-renovar"
                                onClick={() => handleEnviarNotificacion(s)}
                                disabled={notificandoId === s.suscripcionid}
                                style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--warning)' }}
                              >
                                <Bell size={13} /> {notificandoId === s.suscripcionid ? '…' : 'Notificar'}
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

      </div>

      {modalSuscribir.show && (
        <div
          className="modal-overlay"
          ref={overlaySuscribirRef}
          onClick={e => { if (e.target === overlaySuscribirRef.current) setModalSuscribir(emptyModalSuscribir); }}
        >
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Suscribir Cliente</h2>
              <button className="modal-close" onClick={() => setModalSuscribir(emptyModalSuscribir)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar Cliente</label>
                <select
                  value={modalSuscribir.clienteId}
                  onChange={e => {
                    const cliente = clientes.find(c => c.usuarioid === parseInt(e.target.value));
                    setModalSuscribir({
                      show: true,
                      clienteId: parseInt(e.target.value) || 0,
                      clienteNombre: cliente?.nombre || '',
                      clienteEmail: cliente?.email || '',
                    });
                  }}
                >
                  <option value={0}>— Selecciona un cliente —</option>
                  {clientes.map(c => (
                    <option key={c.usuarioid} value={c.usuarioid}>{c.nombre} ({c.email})</option>
                  ))}
                </select>
              </div>

              {modalSuscribir.clienteId > 0 && (
                <>
                  <div style={{
                    background: 'rgba(13,184,211,0.07)',
                    border: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.875rem 1rem',
                    marginBottom: '1rem',
                  }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{modalSuscribir.clienteNombre}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{modalSuscribir.clienteEmail}</p>
                  </div>

                  <div className="form-group">
                    <label>Plan</label>
                    <select
                      value={formSuscripcion.tiposuscripcionid}
                      onChange={e => setFormSuscripcion({ ...formSuscripcion, tiposuscripcionid: parseInt(e.target.value) })}
                    >
                      <option value={1}>Premium — $40/mes (1 tarjeta)</option>
                      <option value={2}>Negocios — $150/mes (10 tarjetas)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Período</label>
                    <select
                      value={formSuscripcion.periodo}
                      onChange={e => setFormSuscripcion({ ...formSuscripcion, periodo: e.target.value })}
                    >
                      <option value="mensual">Mensual (30 días)</option>
                      <option value="anual">Anual (365 días)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formSuscripcion.renovar_automatico}
                        onChange={e => setFormSuscripcion({ ...formSuscripcion, renovar_automatico: e.target.checked })}
                        style={{ width: 'auto', accentColor: 'var(--primary)' }}
                      />
                      Renovación automática
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalSuscribir(emptyModalSuscribir)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={handleSuscribirCliente}
                disabled={!modalSuscribir.clienteId || renovandoId !== null}
              >
                {renovandoId === -1 ? 'Creando…' : 'Crear Suscripción'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalRenovar.show && (
        <div
          className="modal-overlay"
          ref={overlayRenovarRef}
          onClick={e => { if (e.target === overlayRenovarRef.current) setModalRenovar(emptyModalRenovar); }}
        >
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Renovar Suscripción</h2>
              <button className="modal-close" onClick={() => setModalRenovar(emptyModalRenovar)}>×</button>
            </div>

            <div className="modal-body">
              <div style={{
                background: 'rgba(13,184,211,0.07)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1rem',
                marginBottom: '1rem',
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{modalRenovar.nombre}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{modalRenovar.email}</p>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Se agregarán <strong style={{ color: 'var(--text-primary)' }}>30 días</strong> a la suscripción actual.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalRenovar(emptyModalRenovar)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={handleRenovar}
                disabled={renovandoId !== null}
              >
                {renovandoId === modalRenovar.suscripcionid ? 'Renovando…' : 'Confirmar Renovación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuscripciones;