import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onLogin: (datos: any) => void;
  irARegistro: () => void;
  irADashboard: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, irARegistro, irADashboard }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const { login, cargando } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await login(loginData);
      onLogin(response.usuario);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
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
          <input 
            type="password" 
            name="password" 
            placeholder="********" 
            required 
            onChange={handleChange} 
            value={loginData.password}
            disabled={cargando}
          />
        </div>

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
      </div>
    </div>
  );
}

export default Login;