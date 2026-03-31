// src/services/twoFactor.service.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

class TwoFactorService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[2FA] ${options?.method || 'GET'} ${url}`);
      console.log('[2FA] Headers:', {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      });
      if (options?.body) {
        console.log('[2FA] Body:', options.body);
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers
        }
      });
      
      console.log(`[2FA] Response status: ${response.status}`);
      const data = await response.json();
      console.log('[2FA] Response data:', data);

      if (!response.ok) {
        return { error: data.error || data.message || `Error ${response.status}` };
      }
      return { data };
    } catch (error) {
      console.error('[2FA] Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  async sendCode(email: string, tipo: string = 'cliente') {
    console.log('[2FA] sendCode llamado con email:', email, 'tipo:', tipo);
    return this.request('/api/2fa/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, tipo })
    });
  }

  async verifyCode(email: string, codigo: string, tipo: string = 'cliente', backup_code: boolean = false) {
    console.log('[2FA] verifyCode llamado con email:', email, 'codigo:', codigo, 'tipo:', tipo, 'backup_code:', backup_code);
    return this.request('/api/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ email, codigo, tipo, backup_code })
    });
  }

  async enable() {
    console.log('[2FA] enable llamado');
    return this.request('/api/2fa/enable', { method: 'POST' });
  }

  async disable() {
    console.log('[2FA] disable llamado');
    return this.request('/api/2fa/disable', { method: 'POST' });
  }

  async getStatus() {
    console.log('[2FA] getStatus llamado');
    return this.request<{ two_factor_enabled: boolean; two_factor_verified: boolean; backup_codes_remaining: number }>('/api/2fa/status');
  }

  async regenerateBackupCodes() {
    console.log('[2FA] regenerateBackupCodes llamado');
    return this.request('/api/2fa/regenerate-backup-codes', { method: 'POST' });
  }
}

export const twoFactorService = new TwoFactorService();