import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';

interface RegistroProps {
  alFinalizar: () => void;
  irALogin: () => void;
}

const Registro: React.FC<RegistroProps> = ({ alFinalizar, irALogin }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');
  const [exito, setExito] = useState(false);
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<RegisterData>({
    nombre: '', 
    email: '', 
    password: '', 
    telefono: '',
    fecha_nacimiento: '', 
    calle: '', 
    numero_exterior: '',
    colonia: '', 
    ciudad: '', 
    estado: '', 
    codigo_postal: '',
    rfc: '', 
    razon_social: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await register(formData);
      setExito(true);
      setTimeout(() => {
        alFinalizar();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="form-container">
        <div className="exito-mensaje">
          <i className="bi bi-check-circle-fill"></i>
          <h3>¡Registro exitoso!</h3>
          <p>Serás redirigido al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container registration-scroll">
      <button className="btn-volver" onClick={irALogin} type="button">
        <i className="bi bi-arrow-left"></i> Volver al Login
      </button>

      <h2 className="titulo-principal">Registro de Cliente</h2>
      <p className="subtitulo">Completa todos los campos para registrarte</p>

      {error && <div className="error-mensaje">{error}</div>}

      <form onSubmit={handleSubmit} className="grid-form">
        <div className="form-section">
          <h3>Datos Personales</h3>
          <input 
            type="text" 
            name="nombre" 
            placeholder="Nombre Completo" 
            required 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Correo Electrónico" 
            required 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            required 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="telefono" 
            placeholder="Teléfono" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="date" 
            name="fecha_nacimiento" 
            placeholder="Fecha Nacimiento" 
            onChange={handleChange}
            disabled={cargando}
          />
        </div>

        <div className="form-section">
          <h3>Datos Fiscales</h3>
          <input 
            type="text" 
            name="rfc" 
            placeholder="RFC" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="razon_social" 
            placeholder="Razón Social" 
            onChange={handleChange}
            disabled={cargando}
          />
        </div>

        <div className="form-section">
          <h3>Dirección</h3>
          <input 
            type="text" 
            name="calle" 
            placeholder="Calle" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="numero_exterior" 
            placeholder="Número Exterior" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="colonia" 
            placeholder="Colonia" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="ciudad" 
            placeholder="Ciudad" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="estado" 
            placeholder="Estado" 
            onChange={handleChange}
            disabled={cargando}
          />
          <input 
            type="text" 
            name="codigo_postal" 
            placeholder="Código Postal" 
            onChange={handleChange}
            disabled={cargando}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-finalizar" 
          disabled={cargando}
        >
          {cargando ? (
            <> <i className="bi bi-arrow-repeat spin"></i> Registrando...</>
          ) : (
            <> <i className="bi bi-person-plus"></i> Crear Cuenta de Cliente</>
          )}
        </button>
      </form>
    </div>
  );
}

export default Registro;