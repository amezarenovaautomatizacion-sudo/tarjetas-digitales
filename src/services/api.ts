// src/services/api.ts
import { Plantilla, PlantillaDetalle, PreviewResponse, Variable, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[API] ${options?.method || 'GET'} ${url}`);
      console.log('[API] Headers:', {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      });
      if (options?.body) {
        console.log('[API] Body:', options.body);
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers
        }
      });
      
      console.log(`[API] Response status: ${response.status}`);
      const data = await response.json();
      console.log('[API] Response data:', data);
      
      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('[API] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async getPlantillas(params?: { categoriaid?: number; activo?: boolean }) {
    let url = '/api/plantillas';
    const queryParams = new URLSearchParams();
    if (params?.categoriaid) queryParams.append('categoriaid', params.categoriaid.toString());
    if (params?.activo !== undefined) queryParams.append('activo', params.activo ? '1' : '0');
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
    
    console.log('[API] getPlantillas llamado con params:', params);
    return this.request<{ plantillas: Plantilla[] }>(url);
  }

  async getPlantillaById(id: number) {
    console.log('[API] getPlantillaById llamado con id:', id);
    return this.request<{ plantilla: PlantillaDetalle }>(`/api/plantillas/${id}`);
  }

  async getPlantillaBySlug(slug: string) {
    console.log('[API] getPlantillaBySlug llamado con slug:', slug);
    return this.request<{ plantilla: PlantillaDetalle }>(`/api/plantillas/${slug}`);
  }

  async getPreview(id: number, datos: Record<string, string>) {
    console.log('[API] getPreview llamado con id:', id);
    console.log('[API] Datos para preview:', datos);
    return this.request<PreviewResponse>(`/api/plantillas/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ datos })
    });
  }

  async getVariables(activo?: boolean) {
    let url = '/api/variables';
    if (activo !== undefined) url += `?activo=${activo ? '1' : '0'}`;
    console.log('[API] getVariables llamado con activo:', activo);
    return this.request<{ variables: Variable[] }>(url);
  }
}

export const api = new ApiService();