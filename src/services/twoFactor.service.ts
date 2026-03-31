const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class TwoFactorService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
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
      console.log(`2FA Response ${endpoint}:`, { status: response.status, data });
      
      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('2FA Network error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async sendCode(email: string, tipo: string = 'cliente') {
    console.log('Enviando código 2FA a:', email, tipo);
    return this.request('/api/2fa/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, tipo })
    });
  }

  async verifyCode(email: string, codigo: string, tipo: string = 'cliente', backup_code: boolean = false) {
    console.log('Verificando código 2FA:', { email, codigo, tipo, backup_code });
    return this.request('/api/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ email, codigo, tipo, backup_code })
    });
  }

  async enable() {
    return this.request('/api/2fa/enable', { method: 'POST' });
  }

  async disable() {
    return this.request('/api/2fa/disable', { method: 'POST' });
  }

  async getStatus() {
    return this.request<{ two_factor_enabled: boolean; two_factor_verified: boolean; backup_codes_remaining: number }>('/api/2fa/status');
  }

  async regenerateBackupCodes() {
    return this.request('/api/2fa/regenerate-backup-codes', { method: 'POST' });
  }
}

export const twoFactorService = new TwoFactorService();