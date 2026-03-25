import React, { useEffect, useState } from 'react';
import { plantillaService } from '../services/plantilla.service';
import {RespuestaPublica} from '../types/index.ts';

const estilosBase: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.85)', // Un poco más oscuro para que resalte
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflowY: 'auto',
  padding: '20px'
};

interface VistaTarjetaProps {
  slug: string; // Recibimos el slug para usar el método público
  datos: any;
  onCerrar: () => void;
}

const VistaTarjeta: React.FC<VistaTarjetaProps> = ({ slug, datos, onCerrar }) => {
  const [renderData, setRenderData] = useState<RespuestaPublica['renderizado'] | null>(null);
  const [cargando, setCargando] = useState(true);

  // 2. La función vive dentro del useEffect
  useEffect(() => {
    const cargarPantallaCompleta = async () => {
      try {
        setCargando(true);
        
        // 1. Mensaje antes de llamar a la API
        console.log("Iniciando renderizado para el slug:", slug);

        const data = await plantillaService.obtenerTarjetaPublica(slug) as RespuestaPublica;
        
        // 2. Mensaje con los datos recibidos
        console.log("Tarjeta recuperada con éxito:", {
          id: data.tarjetaclienteid,
          nombre: data.nombre_tarjeta,
          visitas: data.visitas,
          tamanio_html: data.renderizado?.html?.length // Para ver si el HTML no viene vacío
        });

        setRenderData(data.renderizado);
      } catch (error) {
        console.error("Error al cargar la tarjeta para el slug:", slug, error);
      } finally {
        setCargando(false);
      }
    };

    if (slug) {
      cargarPantallaCompleta();
    } else {
      console.warn("Se intentó abrir VistaTarjeta pero el slug es undefined o vacío.");
    }
  }, [slug]);
  

  if (cargando) return <div className="overlay">Cargando...</div>;

  return (
    <div className="fullscreen-preview-overlay" style={estilosBase}>
        <style>{renderData?.css}</style>
        
        <div style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '500px' }}>
        <button 
            onClick={onCerrar} 
            style={{ position: 'absolute', top: -40, right: 0, color: 'white' }}
        >
            Cerrar X
        </button>

        {/* Si esto está vacío, la pantalla se verá blanca */}
        <div 
            className="render-container"
            dangerouslySetInnerHTML={{ __html: renderData?.html || '<p style="color:white">No hay contenido</p>' }} 
        />
        </div>
    </div>
    )
};

export default VistaTarjeta;