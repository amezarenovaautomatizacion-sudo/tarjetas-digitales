import { api } from './api';
import { Plantilla, Categoria } from '../types';

export const plantillaService = {
  async obtenerTodas(): Promise<Plantilla[]> {
    const response = await api.get<{ plantillas: Plantilla[] }>('/api/plantillas');
    return response.plantillas;
  },

  async obtenerPorCategoria(categoria: string): Promise<Plantilla[]> {
    const response = await api.get<{ plantillas: Plantilla[] }>(`/api/plantillas/categoria/${categoria}`);
    return response.plantillas;
  },

  async obtenerCategorias(): Promise<Categoria[]> {
    const response = await api.get<{ categorias: Categoria[] }>('/api/categorias');
    return response.categorias;
  },

  async obtenerPorId(id: number): Promise<Plantilla> {
    const response = await api.get<{ plantilla: Plantilla }>(`/api/plantillas/${id}`);
    return response.plantilla;
  }
};