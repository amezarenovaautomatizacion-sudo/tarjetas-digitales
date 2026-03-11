import React, { useState } from 'react';

// Definimos qué datos componen la tarjeta
interface DatosTarjeta {
  nombre: string;
  profesion: string;
  empresa: string;
  telefono: string;
}

const EditorTarjeta: React.FC = () => {
  const [datos, setDatos] = useState<DatosTarjeta>({
    nombre: 'Tu Nombre',
    profesion: 'Tu Profesión',
    empresa: 'Tu Empresa',
    telefono: '000-000-0000'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  return (
    <div className="editor-container">
      {/* PANEL DE CONTROL */}
      <section className="editor-form">
        <h2>Personaliza tu Tarjeta</h2>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} />
        <input name="profesion" placeholder="Profesión" onChange={handleChange} />
        <input name="empresa" placeholder="Empresa" onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
      </section>

      {/* VISTA PREVIA DE LA TARJETA */}
      <section className="tarjeta-preview">
        <div className="card-visual">
          <h3>{datos.nombre}</h3>
          <p>{datos.profesion}</p>
          <p><strong>{datos.empresa}</strong></p>
          <p>📞 {datos.telefono}</p>
        </div>
      </section>
    </div>
  );
};

export default EditorTarjeta;