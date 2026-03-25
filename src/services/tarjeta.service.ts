// src/services/tarjeta.service.ts
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class TarjetaService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    } catch {
      return { error: 'Error de conexión' };
    }
  }

  async listar(params?: any) {
    let url = '/api/cliente/tarjetas';
    if (params) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => { if (params[k]) query.append(k, params[k]); });
      if (query.toString()) url += `?${query.toString()}`;
    }
    return this.request<{ tarjetas: any[] }>(url);
  }

  async crear(data: any) {
    return this.request('/api/cliente/tarjetas', { method: 'POST', body: JSON.stringify(data) });
  }

  async obtener(id: number) {
    return this.request(`/api/cliente/tarjetas/${id}`);
  }

  async obtenerPublica(slug: string) {
    return this.request(`/api/tarjetas/publicas/${slug}`);
  }

  async actualizar(id: number, data: any) {
    return this.request(`/api/cliente/tarjetas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async eliminar(id: number) {
    return this.request(`/api/cliente/tarjetas/${id}`, { method: 'DELETE' });
  }
}

export const tarjetaService = new TarjetaService();