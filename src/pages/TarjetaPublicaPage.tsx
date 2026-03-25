import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface TarjetaPublicaPageProps {
  slug: string;
  onBack: () => void;
}

const TarjetaPublicaPage: React.FC<TarjetaPublicaPageProps> = ({ slug, onBack }) => {
  const [tarjeta, setTarjeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTarjeta = async () => {
      try {
        const response = await fetch(`https://api-tarjetas.vercel.app/api/tarjetas/publicas/${slug}`);
        const data = await response.json();
        if (response.ok) {
          setTarjeta(data);
        } else {
          setError(data.error || 'Tarjeta no encontrada');
        }
      } catch (err) {
        setError('Error de conexión');
      }
      setLoading(false);
    };
    fetchTarjeta();
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  
  if (error || !tarjeta) {
    return (
      <div className="error-container">
        <h2>{error || 'Tarjeta no encontrada'}</h2>
        <button className="btn-back" onClick={onBack}>Volver</button>
      </div>
    );
  }

  return (
    <div className="tarjeta-publica-page">
      <div className="container">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        
        <div className="public-card">
          <div className="public-card-header">
            <h1>{tarjeta.nombre_tarjeta}</h1>
            <div className="public-meta">
              <span className="meta-item">📄 {tarjeta.plantilla_nombre}</span>
              <span className="meta-item">👁️ {tarjeta.visitas || 0} visitas</span>
              <span className="meta-item">🔗 {tarjeta.slug}</span>
            </div>
          </div>
          
          <div className="public-card-content">
            <div className="tarjeta-render">
              <style dangerouslySetInnerHTML={{ __html: tarjeta.renderizado?.css || '' }} />
              <div dangerouslySetInnerHTML={{ __html: tarjeta.renderizado?.html || '' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaPublicaPage;