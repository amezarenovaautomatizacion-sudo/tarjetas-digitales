import React, { useState, useEffect, useRef } from 'react';
import { suscripcionService } from '../services/suscripcion.service';
import { Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, UserPlus, Bell, Send, Calendar, CreditCard, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

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

interface SuscripcionResponse {
  suscripciones: Suscripcion[];
}

interface ClientesResponse {
  clientes: Cliente[];
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
  const [enviandoGlobal, setEnviandoGlobal] = useState(false);
  const [resultadoGlobal, setResultadoGlobal] = useState<{ total: number; exitosos: number; fallidos: number; detalles: any[] } | null>(null);
  const [modalSuscribir, setModalSuscribir] = useState(emptyModalSuscribir);
  const [modalRenovar, setModalRenovar]     = useState(emptyModalRenovar);
  const [formSuscripcion, setFormSuscripcion] = useState({
    tiposuscripcionid: 1,
    periodo: 'mensual',
    renovar_automatico: false,
  });

  const overlaySuscribirRef = useRef<HTMLDivElement>(null);
  const overlayRenovarRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarSuscripciones(); cargarClientes(); }, [filtroEstado, busqueda]);

  const cargarSuscripciones = async () => {
    setLoading(true);
    const res = await suscripcionService.getAllSuscripciones({ estado: filtroEstado || undefined, limite: 100 });
    if (res.data) {
      const responseData = res.data as SuscripcionResponse;
      let data: Suscripcion[] = responseData.suscripciones || [];
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
      const data = await res.json() as ClientesResponse;
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

  const handleEnviarNotificacionesGlobal = async () => {
    if (!confirm('¿Enviar notificaciones a todos los clientes cuya suscripción vence mañana (1 día restante)?')) return;
    
    setEnviandoGlobal(true);
    setResultadoGlobal(null);
    
    try {
      const res = await suscripcionService.getAllSuscripciones({ estado: 'activa', limite: 500 });
      const data = res.data as SuscripcionResponse;
      const suscripcionesActivas = data.suscripciones || [];
      
      const suscripcionesPorNotificar = suscripcionesActivas.filter(suscripcion => {
        const diasRestantes = getDiasRestantes(suscripcion.fecha_fin);
        return diasRestantes === 1;
      });
      
      if (suscripcionesPorNotificar.length === 0) {
        alert('No hay suscripciones que venzan mañana (1 día restante)');
        setEnviandoGlobal(false);
        return;
      }
      
      const resultados = [];
      let exitosos = 0;
      let fallidos = 0;
      
      for (const suscripcion of suscripcionesPorNotificar) {
        try {
          const notificacionRes = await suscripcionService.enviarNotificacionVencimiento(suscripcion.suscripcionid);
          if (notificacionRes.data) {
            exitosos++;
            resultados.push({
              suscripcionid: suscripcion.suscripcionid,
              email: suscripcion.usuario_email,
              nombre: suscripcion.usuario_nombre,
              estado: 'exitoso'
            });
          } else {
            fallidos++;
            resultados.push({
              suscripcionid: suscripcion.suscripcionid,
              email: suscripcion.usuario_email,
              nombre: suscripcion.usuario_nombre,
              estado: 'fallido',
              error: notificacionRes.error
            });
          }
        } catch (error) {
          fallidos++;
          resultados.push({
            suscripcionid: suscripcion.suscripcionid,
            email: suscripcion.usuario_email,
            nombre: suscripcion.usuario_nombre,
            estado: 'fallido',
            error: String(error)
          });
        }
      }
      
      setResultadoGlobal({
        total: suscripcionesPorNotificar.length,
        exitosos,
        fallidos,
        detalles: resultados
      });
      
      alert(`Notificaciones enviadas:\n✅ Exitosas: ${exitosos}\n❌ Fallidas: ${fallidos}\n📧 Total: ${suscripcionesPorNotificar.length}`);
      
    } catch (error) {
      console.error('Error en envío global:', error);
      alert('Error al procesar las notificaciones globales');
    } finally {
      setEnviandoGlobal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const suscripcionesPorVencerManana = suscripciones.filter(s => {
    const dias = getDiasRestantes(s.fecha_fin);
    return dias === 1 && s.estado === 'activa';
  }).length;

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Gestión de Suscripciones</h1>
          <div className="filtros">
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
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
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
            <button
              className="btn-warning"
              onClick={handleEnviarNotificacionesGlobal}
              disabled={enviandoGlobal}
            >
              {enviandoGlobal ? (
                <>
                  <RefreshCw size={16} className="spinning" /> Enviando...
                </>
              ) : (
                <>
                  <Send size={16} /> Notificar Vencimiento (1 día)
                </>
              )}
              {suscripcionesPorVencerManana > 0 && !enviandoGlobal && (
                <span className="notification-badge">
                  {suscripcionesPorVencerManana}
                </span>
              )}
            </button>
          </div>
        </div>

        {resultadoGlobal && (
          <div className="perfil-section" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-light)' }}>Resultado de notificaciones masivas</h3>
              <button
                onClick={() => setResultadoGlobal(null)}
                className="modal-close"
                style={{ position: 'static', width: 'auto', height: 'auto' }}
              >
                ×
              </button>
            </div>
            <div className="dashboard-stats" style={{ marginBottom: '1rem', gap: '1rem' }}>
              <div className="stat-card" style={{ padding: '0.75rem' }}>
                <span className="stat-number" style={{ fontSize: '1.5rem' }}>{resultadoGlobal.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card" style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)' }}>
                <span className="stat-number" style={{ fontSize: '1.5rem', color: '#10b981' }}>{resultadoGlobal.exitosos}</span>
                <span className="stat-label">Exitosos</span>
              </div>
              <div className="stat-card" style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                <span className="stat-number" style={{ fontSize: '1.5rem', color: '#f87171' }}>{resultadoGlobal.fallidos}</span>
                <span className="stat-label">Fallidos</span>
              </div>
            </div>
            {resultadoGlobal.fallidos > 0 && (
              <details style={{ fontSize: '0.875rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>Ver detalles de fallos</summary>
                <div style={{ marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {resultadoGlobal.detalles.filter(d => d.estado === 'fallido').map((detalle, idx) => (
                    <div key={idx} className="error-message" style={{ marginBottom: '0.25rem', padding: '0.5rem' }}>
                      <strong>{detalle.nombre || detalle.email}</strong>: {detalle.error}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

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
                          <span className="plan-badge">
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

      {/* Modal Suscribir */}
      {modalSuscribir.show && (
        <div
          className="modal-overlay"
          ref={overlaySuscribirRef}
          onClick={e => { if (e.target === overlaySuscribirRef.current) setModalSuscribir(emptyModalSuscribir); }}
        >
          <div className="modal-content modal-small">
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
                  <div className="perfil-section" style={{ padding: '1rem', marginBottom: '1rem' }}>
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

      {/* Modal Renovar */}
      {modalRenovar.show && (
        <div
          className="modal-overlay"
          ref={overlayRenovarRef}
          onClick={e => { if (e.target === overlayRenovarRef.current) setModalRenovar(emptyModalRenovar); }}
        >
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Renovar Suscripción</h2>
              <button className="modal-close" onClick={() => setModalRenovar(emptyModalRenovar)}>×</button>
            </div>

            <div className="modal-body">
              <div className="perfil-section" style={{ padding: '1rem', marginBottom: '1rem' }}>
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