import React, { useState, ChangeEvent, FormEvent } from 'react';

// 1. Definimos la interfaz de las props que recibe el Login
interface LoginProps {
  onLogin: (datos: { email: string }) => void;
  irARegistro: () => void;
  irADashboard: () => void;
}

// 2. Definimos la interfaz del estado del formulario
interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, irARegistro, irADashboard }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin({ email: loginData.email });
  };

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={irADashboard}>
        ← Volver al Dashboard
      </button>

      <h2 className="titulo-principal">Iniciar Sesión</h2>
      <p className="subtitulo">Ingresa tus credenciales para continuar</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            name="email" 
            placeholder="correo@ejemplo.com" 
            required 
            onChange={handleChange} 
            value={loginData.email}
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            name="password" 
            placeholder="********" 
            required 
            onChange={handleChange} 
            value={loginData.password}
          />
        </div>

        <button type="submit" className="btn-finalizar">Entrar</button>
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