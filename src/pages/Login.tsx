import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { obtenerIpPublica } from '../utils/ipUtils';

interface LoginProps {
  onLogin: (datos: any) => void;
  irARegistro: () => void;
  irADashboard: () => void;
  irARecuperarPassword: () => void;
}

interface LoginData {
  email: string;
  password: string;
  ip_ultimo_login?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, irARegistro, irADashboard, irARecuperarPassword }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [ipAddress, setIpAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const { login, loginEmpleado, cargando } = useAuth();
  const [esAdmin, setEsAdmin] = useState<boolean>(false);

  // Obtener IP al montar el componente
  useEffect(() => {
    const obtenerIP = async () => {
      const ip = await obtenerIpPublica();
      setIpAddress(ip);
    };
    obtenerIP();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setError('');
  };

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const datosLogin = { ...loginData, ip_ultimo_login: ipAddress };
      
      let response;
      
      // OPCIÓN A: Intentar login de empleado primero si falla el de cliente
      // OPCIÓN B: Usar una lógica de dominio (ejemplo abajo)
      if (esAdmin) {
        const respuesta = await loginEmpleado(datosLogin); // Usa el endpoint /api/login
        onLogin(respuesta.usuario);
      } else {
        const respuesta = await login(datosLogin); // Usa /api/cliente/login
        onLogin(respuesta.usuario);
      }
    } catch (err) {
      setError("Credenciales inválidas para este tipo de acceso");
    }
  };

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={irADashboard} type="button">
        <i className="bi bi-arrow-left"></i> Volver al Dashboard
      </button>

      <h2 className="titulo-principal">Iniciar Sesión</h2>
      <p className="subtitulo">Ingresa tus credenciales para continuar</p>

      {error && <div className="error-mensaje">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>
            <i className="bi bi-envelope"></i> Correo Electrónico
          </label>
          <input 
            type="email" 
            name="email" 
            placeholder="correo@ejemplo.com" 
            required 
            onChange={handleChange} 
            value={loginData.email}
            disabled={cargando}
          />
        </div>

        <div className="input-group">
          <label>
            <i className="bi bi-lock"></i> Contraseña
          </label>
          <div className="password-input-container">
            <input 
              type={mostrarPassword ? "text" : "password"}
              name="password" 
              placeholder="********" 
              required 
              onChange={handleChange} 
              value={loginData.password}
              disabled={cargando}
            />
            <button 
              type="button"
              className="password-toggle-btn"
              onClick={toggleMostrarPassword}
              tabIndex={-1}
            >
              <i className={`bi ${mostrarPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 my-4 p-2 bg-gray-100 rounded">
          <label>
            <i className="bi bi-lock"></i> Eres administrador?
          </label>
          <input 
            type="checkbox" 
            id="admin-toggle"
            checked={esAdmin}
            onChange={(e) => setEsAdmin(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          
        </div>

        {/* IP oculta (no visible para el usuario) */}
        <input type="hidden" name="ip_ultimo_login" value={ipAddress} />

        <button 
          type="submit" 
          className="btn-finalizar" 
          disabled={cargando}
        >
          {cargando ? (
            <> <i className="bi bi-arrow-repeat spin"></i> Procesando...</>
          ) : (
            <> <i className="bi bi-box-arrow-in-right"></i> Entrar</>
          )}
        </button>
      </form>

      <div className="opciones-login">
        <p>¿No tienes una cuenta?</p>
        <button type="button" className="btn-link" onClick={irARegistro}>
          Crear cuenta nueva
        </button>
        <button onClick={irARecuperarPassword}>¿Olvidaste tu contraseña?</button>
      </div>
    </div>
  );
}

export default Login;