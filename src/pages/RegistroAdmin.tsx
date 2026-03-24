import React, { useState, ChangeEvent, FormEvent,useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterAdminData } from '../types';
import { obtenerIpPublica } from '../utils/ipUtils';

interface RegistroAdminProps {
  alFinalizar: () => void;
  irALogin: () => void;
}

const RegistroAdmin: React.FC<RegistroAdminProps> = ({ alFinalizar, irALogin }) => {

    const [ipAddress, setIpAddress] = useState<string>(''); // Crea la variable que falta
    const [error, setError] = useState<string>('');
    const { registerEmpleado, cargando } = useAuth(); // Usamos el nuevo método del hook
    const [formData, setFormData] = useState<RegisterAdminData >({
        nombre: '',
        email: '',
        password: '',
        ip_registro: ipAddress // Usamos la IP obtenida al montar el componente
        });
  
    

    useEffect(() => {
        const obtenerIP = async () => {
            const ip = await obtenerIpPublica(); // Asegúrate de importar esta función
            setIpAddress(ip);
        };
        obtenerIP();
    }, []);
            

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
        await registerEmpleado(formData);
        alert('Registro de Administrador exitoso. Ahora puedes iniciar sesión.');
        alFinalizar();
        } catch (err: any) {
        setError(err.message || 'Error al registrar administrador');
        }
    };

  return (
    <div className="form-container admin-theme">
      <h2 className="titulo-principal">Registro de Personal</h2>
      <p className="subtitulo">Acceso restringido solo para administradores</p>

      {error && <div className="error-mensaje">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label><i className="bi bi-person"></i> Nombre Completo</label>
          <input type="text" name="nombre" required onChange={handleChange} value={formData.nombre} />
        </div>

        <div className="input-group">
          <label><i className="bi bi-envelope"></i> Correo Corporativo</label>
          <input type="email" name="email" required onChange={handleChange} value={formData.email} />
        </div>

        <div className="input-group">
          <label><i className="bi bi-lock"></i> Contraseña</label>
          <input type="password" name="password" required onChange={handleChange} value={formData.password} />
        </div>

        <button type="submit" className="btn-finalizar admin-btn" disabled={cargando}>
          {cargando ? 'Procesando...' : 'Registrar Administrador'}
        </button>
      </form>

      <button className="btn-link" onClick={irALogin}>Volver al Login</button>
    </div>
  );
};

export default RegistroAdmin;