import React, { useState, ChangeEvent, FormEvent } from 'react';
const API_URL: string = import.meta.env.VITE_API_URL;
//cambio de prueba

// 1. Interfaz completa según la documentación de tu API
interface FormDataCliente {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string;
  calle: string;
  numero_exterior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  rfc: string;
  razon_social: string;
}

const Registro: React.FC = () => {
  const [cargando, setCargando] = useState(false);
  
  // 2. Inicializamos todos los campos requeridos
  const [formData, setFormData] = useState<FormDataCliente>({
    nombre: '', email: '', password: '', telefono: '',
    fecha_nacimiento: '', calle: '', numero_exterior: '',
    colonia: '', ciudad: '', estado: '', codigo_postal: '',
    rfc: '', razon_social: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 3. Endpoint exacto para Rol 4

      const response = await fetch(`${API_URL}/api/cliente/register`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok) {
        alert("¡Registro de cliente exitoso!");
      } else {
        alert("Error: " + (resData.message || "Verifica los datos"));
        console.log("Detalle del error:", resData);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-container registration-scroll">
      <h2>Registro de Cliente (Rol 4)</h2>
      <form onSubmit={handleSubmit} className="grid-form">
        {/* Datos Principales */}
        <input type="text" name="nombre" placeholder="Nombre Completo" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Correo" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Contraseña" required onChange={handleChange} />
        
        {/* Datos de contacto y ubicación requeridos por tu API */}
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <input type="date" name="fecha_nacimiento" placeholder="Fecha Nacimiento" onChange={handleChange} />
        <input type="text" name="calle" placeholder="Calle" onChange={handleChange} />
        <input type="text" name="ciudad" placeholder="Ciudad" onChange={handleChange} />
        <input type="text" name="rfc" placeholder="RFC" onChange={handleChange} />
        
        <button type="submit" className="btn-finalizar" disabled={cargando}>
          {cargando ? "Registrando..." : "Crear Cuenta de Cliente"}
        </button>
      </form>
    </div>
  );
}

export default Registro;

