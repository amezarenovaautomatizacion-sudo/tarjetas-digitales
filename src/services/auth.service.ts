import { api } from './api';
import { UsuarioData, LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/cliente/login', credentials);
    if (response.token) {
      api.setToken(response.token);
    }
    return response;
  },

    async login_empleados(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/login', credentials);
    if (response.token) {
      api.setToken(response.token);
    }
    return response;
  },

  async registerCliente(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/cliente/register', data);
    return response;
  },

  async logout(): Promise<void> {
    api.removeToken();
  },

  async getCurrentUser(): Promise<UsuarioData | null> {
    try {
      const token = api.getToken();
      if (!token) return null;
      
      const response = await api.get<{ usuario: UsuarioData }>('/api/cliente/profile');
      return response.usuario;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!api.getToken();
  }
};