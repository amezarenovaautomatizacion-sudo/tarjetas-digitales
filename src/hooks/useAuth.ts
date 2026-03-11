import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { usuarioService } from '../services/usuario.service';
import { UsuarioData, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      setCargando(true);
      const usuarioActual = await authService.getCurrentUser();
      setUsuario(usuarioActual);
    } catch (err) {
      setError('Error al verificar sesión');
    } finally {
      setCargando(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setCargando(true);
      setError(null);
      const response = await authService.login(credentials);
      setUsuario(response.usuario);
      return response;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUsuario(null);
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setCargando(true);
      setError(null);
      const response = await authService.registerCliente(data);
      return response;
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const actualizarPerfil = useCallback(async (data: Partial<UsuarioData>) => {
    try {
      setCargando(true);
      setError(null);
      const usuarioActualizado = await usuarioService.actualizarPerfil(data);
      setUsuario(usuarioActualizado);
      return usuarioActualizado;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    usuario,
    cargando,
    error,
    login,
    logout,
    register,
    actualizarPerfil,
    isAuthenticated: !!usuario,
  };
};