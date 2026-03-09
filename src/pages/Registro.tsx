import React, { useState, ChangeEvent, FormEvent } from 'react';

// 1. Interfaz con nombres exactos
interface FormData {
  nombre: string;
  direccion: string;
  contrasenia: string; // Usamos 'n' para evitar errores de codificación
  numero: string;
  empresa: string;
  profesion: string;
  email: string;
}

type Perfil = 'cliente' | 'diseñador' | null;

const Registro: React.FC = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<Perfil>(null);
  
  // 2. El objeto inicial DEBE tener todas las llaves de la interfaz
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    direccion: '',
    contrasenia: '', // Verifica que este nombre sea igual al de la interfaz arriba
    numero: '',
    empresa: '',
    profesion: '',
    email: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("¡Registro enviado!");
  };

  if (!tipoSeleccionado) {
    return (
      <div className="seleccion-contenedor">
        <h2 className="titulo-principal">Selecciona tu perfil</h2>
        <div className="opciones-grid">
          <div className="opcion-card cliente" onClick={() => setTipoSeleccionado('cliente')}>
            <span className="icon">👤</span>
            <h3>Soy Cliente</h3>
            <span className="btn-falso">Seleccionar</span>
          </div>
          <div className="opcion-card disenador" onClick={() => setTipoSeleccionado('diseñador')}>
            <span className="icon">🎨</span>
            <h3>Soy Diseñador</h3>
            <span className="btn-falso">Seleccionar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={() => setTipoSeleccionado(null)}>← Volver</button>
      <h2>Registro para {tipoSeleccionado}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        {/* El atributo 'name' debe ser exactamente 'contrasenia' */}
        <input type="password" name="contrasenia" placeholder="Contraseña" required onChange={handleChange} />
        <input type="text" name="direccion" placeholder="Dirección" onChange={handleChange} />
        <input type="tel" name="numero" placeholder="Teléfono" onChange={handleChange} />
        <button type="submit" className="btn-finalizar">Finalizar Registro</button>
      </form>
    </div>
  );
}

export default Registro;