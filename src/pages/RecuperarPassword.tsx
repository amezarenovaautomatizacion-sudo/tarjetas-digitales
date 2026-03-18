import React, { useState } from 'react';
import { usuarioService } from '../services/usuario.service';

interface RecuperarProps {
  onVolver: () => void;
}

const RecuperarPassword: React.FC<RecuperarProps> = ({ onVolver }) => {
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCargando(true);
      await usuarioService.solicitarRecuperacion(email);
      setMensaje({ tipo: 'exito', texto: 'Se ha enviado un token a tu correo.' });
      setPaso(2);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'No pudimos procesar tu solicitud.' });
    } finally {
      setCargando(false);
    }
  };

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCargando(true);
      await usuarioService.restablecerPassword(token, newPassword);
      alert('Contraseña actualizada con éxito');
      onVolver(); // Regresamos al login
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Token inválido o error al cambiar.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      
      {paso === 1 ? (
        <form onSubmit={handleSolicitar}>
          <h2>Recuperar Contraseña</h2>
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" placeholder="Correo electrónico" required onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar token'}
          </button>
          <button type="button" className="btn-link" onClick={onVolver}>Volver al login</button>
        </form>
      ) : (
        <form onSubmit={handleRestablecer}>
          <h2>Nueva Contraseña</h2>
          <label htmlFor="email">Ingresa el token que llego a tu correo</label>
          <input placeholder="Ingresa el token" required onChange={(e) => setToken(e.target.value)} />
          <label htmlFor="email">Ingresa tu nueva contraseña</label>
          <input type="password" placeholder="Nueva contraseña" required onChange={(e) => setNewPassword(e.target.value)} />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Confirmar cambio'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RecuperarPassword;