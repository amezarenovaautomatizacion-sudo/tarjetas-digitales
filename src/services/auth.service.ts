// src/services/auth.service.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class AuthService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[AUTH] ${options?.method || 'GET'} ${url}`);
      console.log('[AUTH] Headers:', {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      });
      if (options?.body) {
        const bodyObj = JSON.parse(options.body as string);
        if (bodyObj.password) {
          console.log('[AUTH] Body:', { ...bodyObj, password: '***' });
        } else {
          console.log('[AUTH] Body:', bodyObj);
        }
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers
        }
      });
      
      console.log(`[AUTH] Response status: ${response.status}`);
      const data = await response.json();
      console.log('[AUTH] Response data:', data);

      if (!response.ok) {
        if (data && (data.requires_two_factor || data.error === "Se requiere código de verificación")) {
          console.log('[AUTH] Se requiere 2FA');
          return { data };
        }
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('[AUTH] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async login(credentials: {
    email: string;
    password: string;
    ip_ultimo_login?: string;
    tipo?: string;
    two_factor_code?: string;
    backup_code?: string
  }) {
    const endpoint = credentials.tipo === 'admin' ? '/api/login' : '/api/cliente/login';
    
    console.log('[AUTH] login llamado');
    console.log('[AUTH] Credentials:', {
      email: credentials.email,
      tipo: credentials.tipo,
      ip_ultimo_login: credentials.ip_ultimo_login,
      has_two_factor_code: !!credentials.two_factor_code,
      has_backup_code: !!credentials.backup_code
    });

    const body: any = {
      email: credentials.email,
      password: credentials.password,
      ip_ultimo_login: credentials.ip_ultimo_login || '0.0.0.0'
    };

    if (credentials.tipo === 'admin') {
      body.tipo = 'admin';
    }

    if (credentials.two_factor_code) {
      body.two_factor_code = credentials.two_factor_code;
    }

    if (credentials.backup_code) {
      body.backup_code = credentials.backup_code;
    }

    const response = await this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (response.data && response.data.token) {
      console.log('[AUTH] Login exitoso, token guardado');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', credentials.tipo === 'admin' ? 'admin' : 'cliente');
      localStorage.setItem('userData', JSON.stringify(response.data.usuario));
    }

    return response;
  }

  async registerCliente(data: any) {
    console.log('[AUTH] registerCliente llamado con data:', { ...data, password: '***' });
    return this.request('/api/cliente/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async registerAdmin(data: any) {
    console.log('[AUTH] registerAdmin llamado con data:', { ...data, password: '***' });
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout() {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/logout' : '/api/cliente/logout';
    console.log('[AUTH] logout llamado, endpoint:', endpoint);
    await this.request(endpoint, { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    console.log('[AUTH] Sesión cerrada');
  }

  async getProfile() {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/profile' : '/api/cliente/profile';
    console.log('[AUTH] getProfile llamado, endpoint:', endpoint);
    return this.request(endpoint);
  }

  async updateProfile(data: any) {
    console.log('[AUTH] updateProfile llamado con data:', data);
    return this.request('/api/cliente/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(password_actual: string, password_nuevo: string) {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/api/change-password' : '/api/cliente/change-password';
    console.log('[AUTH] changePassword llamado');
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ password_actual, password_nuevo })
    });
  }

  async forgotPassword(email: string, tipo: string = 'cliente') {
    const endpoint = tipo === 'admin' ? '/api/forgot-password' : '/api/cliente/forgot-password';
    console.log('[AUTH] forgotPassword llamado con email:', email, 'tipo:', tipo);
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, tipo })
    });
  }

  async resetPassword(token: string, new_password: string, tipo: string = 'cliente') {
    const endpoint = tipo === 'admin' ? '/api/reset-password' : '/api/cliente/reset-password';
    console.log('[AUTH] resetPassword llamado con token:', token, 'tipo:', tipo);
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ token, new_password, tipo })
    });
  }
}

export const authService = new AuthService();