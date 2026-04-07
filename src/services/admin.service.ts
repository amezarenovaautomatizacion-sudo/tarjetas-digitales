// src/services/admin.service.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class AdminService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers
        }
      });
      const data = await response.json();
      if (!response.ok) return { error: data.error || data.message || `Error ${response.status}` };
      return { data };
    } catch (error) {
      console.error('[ADMIN] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async getUsuarios(params?: { tipo?: string; busqueda?: string; activo?: number }) {
    let url = '/api/admin/usuarios';
    const query = new URLSearchParams();
    if (params?.tipo) query.append('tipo', params.tipo);
    if (params?.busqueda) query.append('busqueda', params.busqueda);
    if (params?.activo !== undefined) query.append('activo', params.activo.toString());
    if (query.toString()) url += `?${query.toString()}`;
    return this.request<{ admins: any[]; clientes: any[]; total_admins: number; total_clientes: number; total: number }>(url);
  }

  async getUsuarioById(id: number, tipo?: string) {
    let url = `/api/admin/usuarios/${id}`;
    if (tipo) url += `?tipo=${tipo}`;
    return this.request<{ usuario: any }>(url);
  }

  async updateUsuarioRol(id: number, rolid: number, tipo?: string) {
    return this.request(`/api/admin/usuarios/${id}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rolid, tipo })
    });
  }

  async updateUsuarioEstado(id: number, activo: number, tipo?: string) {
    return this.request(`/api/admin/usuarios/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ activo, tipo })
    });
  }

  async deleteUsuario(id: number, tipo?: string) {
    return this.request(`/api/admin/usuarios/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ tipo })
    });
  }

  async getDashboardStats() {
    return this.request<{ usuarios: any; contenido: any; suscripciones_activas: number; tarjetas_populares: any[]; actividad_reciente: any[] }>('/api/admin/dashboard/stats');
  }

  async getEstadisticasVisitas(periodo?: string) {
    let url = '/api/admin/estadisticas/visitas';
    if (periodo) url += `?periodo=${periodo}`;
    return this.request(url);
  }

  async getEstadisticasTarjetas() {
    return this.request('/api/admin/estadisticas/tarjetas');
  }

  async getVariablesAdmin() {
    return this.request<{ variables: any[] }>('/api/admin/variables');
  }

  async createVariable(data: any) {
    return this.request('/api/admin/variables', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateVariable(id: number, data: any) {
    return this.request(`/api/admin/variables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteVariable(id: number) {
    return this.request(`/api/admin/variables/${id}`, {
      method: 'DELETE'
    });
  }

  async getCategorias() {
    return this.request<{ categorias: any[] }>('/api/admin/categorias');
  }

  async createCategoria(data: any) {
    return this.request('/api/admin/categorias', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategoria(id: number, data: any) {
    return this.request(`/api/admin/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCategoria(id: number) {
    return this.request(`/api/admin/categorias/${id}`, {
      method: 'DELETE'
    });
  }

  async getLogs(params?: { limite?: number; pagina?: number; accion?: string; admin_id?: number }) {
    let url = '/api/admin/logs';
    const query = new URLSearchParams();
    if (params?.limite) query.append('limite', params.limite.toString());
    if (params?.pagina) query.append('pagina', params.pagina.toString());
    if (params?.accion) query.append('accion', params.accion);
    if (params?.admin_id) query.append('admin_id', params.admin_id.toString());
    if (query.toString()) url += `?${query.toString()}`;
    return this.request<{ logs: any[]; paginacion: any }>(url);
  }

  async getLogsByUsuario(id: number) {
    return this.request(`/api/admin/logs/usuario/${id}`);
  }
}

export const adminService = new AdminService();