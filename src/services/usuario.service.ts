import { api } from './api';
import { UsuarioData, UpdateUserData } from '../types';


export const usuarioService = {
  async getPerfil(): Promise<UsuarioData> {
    const response = await api.get<{ usuario: UsuarioData }>('/api/usuario/perfil');
    return response.usuario;
  },

  async actualizarPerfil(data: UpdateUserData): Promise<UsuarioData> {
    const response = await api.put<{ usuario: UsuarioData }>('/api/cliente/update-profile', data);
    return response.usuario;
  },

  async cambiarPassword(password_actual: string, password_nuevo: string): Promise<void> {
    return await api.put('/api/cliente/change-password', { 
      password_actual, 
      password_nuevo 
    })
  },

  async solicitarRecuperacion(email: string): Promise<any> {
    return await api.post('/api/cliente/forgot-password', { email });
  },

  async restablecerPassword(token: string, new_password: string): Promise<any> {
    return await api.post('/api/cliente/reset-password', { token, new_password });
  }
};