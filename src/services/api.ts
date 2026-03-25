// src/services/api.ts
import { Plantilla, PlantillaDetalle, PreviewResponse, Variable, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
        ...options, 
        headers: { 'Content-Type': 'application/json', ...options?.headers } 
      });
      const data = await response.json();
      if (!response.ok) return { error: data.error || data.message || `Error ${response.status}` };
      return { data };
    } catch {
      return { error: 'Error de conexión' };
    }
  }

  async getPlantillas(params?: { categoriaid?: number; activo?: boolean }) {
    let url = '/api/plantillas';
    const queryParams = new URLSearchParams();
    if (params?.categoriaid) queryParams.append('categoriaid', params.categoriaid.toString());
    if (params?.activo !== undefined) queryParams.append('activo', params.activo ? '1' : '0');
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
    return this.request<{ plantillas: Plantilla[] }>(url);
  }

  async getPlantillaById(id: number) {
    return this.request<{ plantilla: PlantillaDetalle }>(`/api/plantillas/${id}`);
  }

  async getPlantillaBySlug(slug: string) {
    return this.request<{ plantilla: PlantillaDetalle }>(`/api/plantillas/${slug}`);
  }

  async getPreview(id: number, datos: Record<string, string>) {
    return this.request<PreviewResponse>(`/api/plantillas/${id}/preview`, { 
      method: 'POST', 
      body: JSON.stringify({ datos }) 
    });
  }

  async getVariables(activo?: boolean) {
    let url = '/api/variables';
    if (activo !== undefined) url += `?activo=${activo ? '1' : '0'}`;
    return this.request<{ variables: Variable[] }>(url);
  }
}

export const api = new ApiService();