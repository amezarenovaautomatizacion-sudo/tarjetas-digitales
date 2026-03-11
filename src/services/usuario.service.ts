import { api } from './api';
import { UsuarioData, UpdateUserData } from '../types';

export const usuarioService = {
  async getPerfil(): Promise<UsuarioData> {
    const response = await api.get<{ usuario: UsuarioData }>('/api/usuario/perfil');
    return response.usuario;
  },

  async actualizarPerfil(data: UpdateUserData): Promise<UsuarioData> {
    const response = await api.put<{ usuario: UsuarioData }>('/api/usuario/perfil', data);
    return response.usuario;
  },

  async cambiarPassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/api/usuario/cambiar-password', { oldPassword, newPassword });
  }
};