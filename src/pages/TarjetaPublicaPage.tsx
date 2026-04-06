import React, { useState, useEffect } from 'react';
import { Eye, FileText, Link, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface TarjetaPublicaPageProps {
  slug: string;
  onBack: () => void;
}

const TarjetaPublicaPage: React.FC<TarjetaPublicaPageProps> = ({ slug, onBack }) => {
  const { isAuthenticated } = useAuth();
  const [tarjeta, setTarjeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTarjeta = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tarjetas/publicas/${slug}`);
        const data = await response.json();
        if (response.ok) {
          setTarjeta(data);
        } else {
          setError(data.error || 'Tarjeta no encontrada');
        }
      } catch {
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
        <button className="btn-back" onClick={onBack}>← Volver</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="tarjeta-publica-page" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: 'var(--spacing-xl)',
      }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <div className="public-card">
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
  }

  return (
    <div className="tarjeta-publica-page">
      <div className="container">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="public-card">

          <div className="public-card-header plantillas-title">
            <h1>{tarjeta.nombre_tarjeta}</h1>
            <div className="public-meta">
              <span className="meta-item">
                <FileText size={14} /> {tarjeta.plantilla_nombre}
              </span>
              <span className="meta-item">
                <Eye size={14} /> {tarjeta.visitas || 0} visitas
              </span>
              <span className="meta-item">
                <Link size={14} />
                <code style={{
                  background: 'rgba(13,184,211,0.1)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--primary-light)',
                }}>
                  {tarjeta.slug}
                </code>
              </span>
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