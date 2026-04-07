import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { adminService } from '../services/admin.service';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  usuarios: { admins: number; clientes: number; total: number };
  contenido: { plantillas: number; tarjetas: number; visitas_totales: number };
  suscripciones_activas: number;
  tarjetas_populares: any[];
  actividad_reciente: any[];
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setLoading(true);
    const [statsRes] = await Promise.all([
      adminService.getDashboardStats(),
    ]);
    if (statsRes.data) setStats(statsRes.data);
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statItems = [
    { label: 'Usuarios Totales',       value: stats?.usuarios.total ?? 0 },
    { label: 'Clientes',               value: stats?.usuarios.clientes ?? 0 },
    { label: 'Administradores',        value: stats?.usuarios.admins ?? 0 },
    { label: 'Tarjetas Creadas',       value: stats?.contenido.tarjetas ?? 0 },
    { label: 'Plantillas',             value: stats?.contenido.plantillas ?? 0 },
    { label: 'Suscripciones Activas',  value: stats?.suscripciones_activas ?? 0 },
    { label: 'Visitas Totales',        value: (stats?.contenido.visitas_totales ?? 0).toLocaleString() },
  ];

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1>Dashboard Administrativo</h1>
          <button className="btn-refresh" onClick={cargarDashboard}>
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        <div className="dashboard-stats">
          {statItems.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-number">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="perfil-section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Tarjetas más populares
          </h2>
          <div className="suscripciones-table-container">
            <table className="suscripciones-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tarjeta</th>
                  <th>Usuario</th>
                  <th>Visitas</th>
                </tr>
              </thead>
              <tbody>
                {stats?.tarjetas_populares?.length ? (
                  stats.tarjetas_populares.map((t, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                      <td><strong>{t.nombre_tarjeta}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.usuario_nombre || 'N/A'}</td>
                      <td>
                        <span style={{
                          background: 'rgba(13,184,211,0.15)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}>
                          {t.visitas}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="no-data">No hay datos disponibles</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="perfil-section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Actividad reciente del sistema
          </h2>
          <div className="suscripciones-table-container">
            <table className="suscripciones-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Administrador</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                </tr>
              </thead>
              <tbody>
                {stats?.actividad_reciente?.length ? (
                  stats.actividad_reciente.map((log, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(log.fecha).toLocaleString()}
                      </td>
                      <td>{log.admin_nombre || 'Sistema'}</td>
                      <td>
                        <span style={{
                          background: 'rgba(13,184,211,0.15)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          {log.accion}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{log.entidad}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="no-data">No hay actividad reciente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;