const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class SuscripcionService {
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
      
      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('[SUSCRIPCION] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async getTiposSuscripcion() {
    return this.request<{ tipos: any[] }>('/api/suscripciones/tipos');
  }

  async getMiSuscripcion() {
    return this.request('/api/cliente/suscripcion/mi-suscripcion');
  }

  async getHistorialSuscripciones(params?: { limite?: number; pagina?: number }) {
    let url = '/api/cliente/suscripcion/historial';
    if (params) {
      const query = new URLSearchParams();
      if (params.limite) query.append('limite', params.limite.toString());
      if (params.pagina) query.append('pagina', params.pagina.toString());
      if (query.toString()) url += `?${query.toString()}`;
    }
    return this.request(url);
  }

  async getDashboardStats() {
    return this.request('/api/cliente/dashboard');
  }

  async getAllSuscripciones(params?: { estado?: string; tipo_usuario?: string; limite?: number; pagina?: number }) {
    let url = '/api/admin/suscripciones';
    if (params) {
      const query = new URLSearchParams();
      if (params.estado) query.append('estado', params.estado);
      if (params.tipo_usuario) query.append('tipo_usuario', params.tipo_usuario);
      if (params.limite) query.append('limite', params.limite.toString());
      if (params.pagina) query.append('pagina', params.pagina.toString());
      if (query.toString()) url += `?${query.toString()}`;
    }
    return this.request(url);
  }

  async renovarSuscripcionAdmin(suscripcionid: number, dias_extra?: number) {
    return this.request(`/api/admin/suscripciones/${suscripcionid}/renovar`, {
      method: 'POST',
      body: JSON.stringify({ dias_extra })
    });
  }

  async crearSuscripcionAdmin(usuarioid: number, tiposuscripcionid: number, dias: number, renovarAutomatico: boolean) {
  return this.request('/api/admin/suscripciones/crear', {
    method: 'POST',
    body: JSON.stringify({ usuarioid, tiposuscripcionid, dias, renovar_automatico: renovarAutomatico })
  });
}

async enviarNotificacionVencimiento(suscripcionid: number) {
  return this.request(`/api/admin/suscripciones/${suscripcionid}/notificar-vencimiento`, {
    method: 'POST'
  });
}
}

export const suscripcionService = new SuscripcionService();