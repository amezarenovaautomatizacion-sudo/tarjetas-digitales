// src/hooks/useSessionTimeout.ts
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Token expira en 12 horas (43200000 ms)
const TOKEN_EXPIRATION_MS = 12 * 60 * 60 * 1000;

export const useSessionTimeout = (onLogout?: () => void) => {
  const navigate = useNavigate();

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Decodificar token JWT para obtener expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a ms
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        // Token expirado
        console.log('Token expirado, cerrando sesión');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        
        if (onLogout) {
          onLogout();
        }
        
        navigate('/login');
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        // Token válido, programar próximo check
        const timeUntilExpiration = expirationTime - currentTime;
        const checkInterval = Math.min(timeUntilExpiration, TOKEN_EXPIRATION_MS);
        
        setTimeout(() => {
          checkTokenExpiration();
        }, checkInterval);
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      // Si hay error decodificando, asumir token inválido
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      
      if (onLogout) {
        onLogout();
      }
      
      navigate('/login');
    }
  }, [navigate, onLogout]);

  useEffect(() => {
    // Verificar al montar el componente
    checkTokenExpiration();

    // También verificar cuando la página recibe foco (por si el usuario la dejó abierta)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkTokenExpiration]);
};

export default useSessionTimeout;