// src/services/auth.service.ts
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class AuthService {
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
      
      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('Network error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async login(credentials: { email: string; password: string; ip_ultimo_login?: string; tipo?: string }) {
    const endpoint = credentials.tipo === 'admin' ? '/api/login' : '/api/cliente/login';
    
    const body: any = {
      email: credentials.email,
      password: credentials.password,
      ip_ultimo_login: credentials.ip_ultimo_login || '0.0.0.0'
    };
    
    if (credentials.tipo === 'admin') {
      body.tipo = 'admin';
    }
    
    const response = await this.request<{ token: string; usuario: any }>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    });
    
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', credentials.tipo === 'admin' ? 'admin' : 'cliente');
      localStorage.setItem('userData', JSON.stringify(response.data.usuario));
    }
    return response;
  }

  async registerCliente(data: any) {
    return this.request('/api/cliente/register', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }

  async registerAdmin(data: any) {
    return this.request('/api/register', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }

  async logout() {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/logout' : '/api/cliente/logout';
    await this.request(endpoint, { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
  }

  async getProfile() {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/profile' : '/api/cliente/profile';
    return this.request(endpoint);
  }

  async updateProfile(data: any) {
    return this.request('/api/cliente/update-profile', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    });
  }

  async changePassword(password_actual: string, password_nuevo: string) {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/change-password' : '/api/cliente/change-password';
    return this.request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify({ password_actual, password_nuevo }) 
    });
  }

  async forgotPassword(email: string, tipo: string = 'cliente') {
    const endpoint = tipo === 'admin' ? '/api/forgot-password' : '/api/cliente/forgot-password';
    return this.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify({ email, tipo }) 
    });
  }

  async resetPassword(token: string, new_password: string, tipo: string = 'cliente') {
    const endpoint = tipo === 'admin' ? '/api/reset-password' : '/api/cliente/reset-password';
    return this.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify({ token, new_password, tipo }) 
    });
  }
}

export const authService = new AuthService();