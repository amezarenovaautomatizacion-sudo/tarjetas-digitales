import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setUsuario(JSON.parse(userData));
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string; tipo?: string }) => {
    try {
      setCargando(true);
      setError(null);
      const response = await authService.login(credentials);
      if (response.data) {
        setUsuario(response.data.usuario);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
  }, []);

  return { usuario, cargando, error, login, logout, isAuthenticated: !!usuario };
};