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
  },

  async generarPreview(id: number, formulario: any): Promise<any> {
    // El backend espera recibir { "datos": { ... } }
    const response = await api.post<any>(`/api/plantillas/${id}/preview`, { 
      datos: formulario 
    });
    return response;
  },

  async guardarTarjeta(plantillaId: number, nombreTarjeta: string, datos: any) {
    const response = await api.post<any>('/api/cliente/tarjetas', {
      plantillaid: plantillaId,              
      nombre_tarjeta: nombreTarjeta,         
      visibilidad: "privado",                
      datos: datos
    });
    return response;
  },

  async obtenerMisTarjetas() {
    const response = await api.get<any>('/api/cliente/tarjetas');
    return response.tarjetas || [];
  },

  async obtenerTarjetaPorId(id: number) {
    const response = await api.get<any>(`/api/cliente/tarjetas/${id}`);
    return response; // Retorna el objeto de la tarjeta o su HTML renderizado
  },

  async actualizarTarjeta(id: number, nombreTarjeta: string, datos: any) {
  // Asegúrate de usar la ruta en plural y pasar el ID
    const response = await api.put(`/api/cliente/tarjetas/${id}`, {
      nombre_tarjeta: nombreTarjeta,
      visibilidad: "publico", // O "privado" según prefieras
      datos: datos // El objeto con nombre, puesto, etc.
    });
    return response;
  },
  
  async eliminarTarjeta(id: number) {
    // Según tu documentación: DELETE /api/cliente/tarjetas/:id
    const response = await api.delete<any>(`/api/cliente/tarjetas/${id}`);
    return response;
  },


  async obtenerTarjetaPublica(slug: string): Promise<any> { 
    const response = await api.get(`/api/tarjetas/publicas/${slug}`);
    return response; // Aquí es donde se origina el tipo que causa el conflicto
  }
};