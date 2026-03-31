// src/services/tarjeta.service.ts
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class TarjetaService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[TARJETA] ${options?.method || 'GET'} ${url}`);
      console.log('[TARJETA] Headers:', {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      });
      if (options?.body) {
        console.log('[TARJETA] Body:', options.body);
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers
        }
      });
      
      console.log(`[TARJETA] Response status: ${response.status}`);
      const data = await response.json();
      console.log('[TARJETA] Response data:', data);
      
      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('[TARJETA] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async listar(params?: any) {
    let url = '/api/cliente/tarjetas';
    if (params) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.append(k, params[k]);
        }
      });
      if (query.toString()) url += `?${query.toString()}`;
    }
    console.log('[TARJETA] listar llamado con params:', params);
    console.log('[TARJETA] URL:', url);
    return this.request<{ tarjetas: any[]; paginacion: any }>(url);
  }

  async crear(data: any) {
    console.log('[TARJETA] crear llamado con data:', {
      ...data,
      datos: '***'
    });
    return this.request('/api/cliente/tarjetas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async obtener(id: number) {
    console.log('[TARJETA] obtener llamado con id:', id);
    return this.request(`/api/cliente/tarjetas/${id}`);
  }

  async obtenerPublica(slug: string) {
    console.log('[TARJETA] obtenerPublica llamado con slug:', slug);
    return this.request(`/api/tarjetas/publicas/${slug}`);
  }

  async actualizar(id: number, data: any) {
    console.log('[TARJETA] actualizar llamado con id:', id);
    console.log('[TARJETA] Data a actualizar:', {
      ...data,
      datos: '***'
    });
    return this.request(`/api/cliente/tarjetas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async eliminar(id: number) {
    console.log('[TARJETA] eliminar llamado con id:', id);
    return this.request(`/api/cliente/tarjetas/${id}`, {
      method: 'DELETE'
    });
  }
}

export const tarjetaService = new TarjetaService();