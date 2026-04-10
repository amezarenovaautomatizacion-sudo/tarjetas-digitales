import React, { useState, useEffect, useRef } from 'react';
import { Eye, FileText, Link, ArrowLeft, QrCode, Download, X, ShoppingBag, Copy } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tarjetas.vercel.app';

interface TarjetaPublicaPageProps {
  slug: string;
  onBack: () => void;
}

const TarjetaPublicaPage: React.FC<TarjetaPublicaPageProps> = ({ slug, onBack }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [tarjeta, setTarjeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [anuncioModalOpen, setAnuncioModalOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const anuncioOverlayRef = useRef<HTMLDivElement>(null);

  const getCurrentUrl = () => {
    return `${window.location.origin}/tarjeta/${slug}`;
  };

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

  const handleCopyUrl = async () => {
    const url = getCurrentUrl();
    try {
      await navigator.clipboard.writeText(url);
      showSuccess('URL copiada al portapapeles', 'Copiado');
    } catch (err) {
      showError('No se pudo copiar la URL', 'Error');
    }
  };

  const handleOpenQrModal = async () => {
    setQrModalOpen(true);
    setQrLoading(true);
    setQrError('');
    setQrImageUrl(null);

    try {
      const url = getCurrentUrl();
      
      // Validar que la URL sea válida para el endpoint
      // Si estamos en localhost, mostrar un mensaje o usar una URL alternativa
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Mostrar mensaje amigable para desarrollo local
        setQrError('En entorno de desarrollo local, el código QR se generará correctamente en producción. Puedes copiar la URL manualmente.');
        setQrLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/qr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          format: 'png',
          size: 400
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el código QR');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrImageUrl(imageUrl);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Error al generar el código QR');
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseQrModal = () => {
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl);
    }
    setQrModalOpen(false);
    setQrImageUrl(null);
    setQrError('');
    setAnuncioModalOpen(true);
  };

  const handleCloseAnuncioModal = () => {
    setAnuncioModalOpen(false);
  };

  const handleAnuncioOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === anuncioOverlayRef.current) {
      handleCloseAnuncioModal();
    }
  };

  const handleDownloadQr = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = `qr-${tarjeta?.slug || 'tarjeta'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('QR descargado correctamente', 'Descargado');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !tarjeta) {
    return (
      <div className="error-container">
        <h2>{error || 'Tarjeta no encontrada'}</h2>
        <button className="btn-back" onClick={onBack}>← Volver</button>
      </div>
    );
  }

  const renderQrModal = () => (
    <div 
      className="modal-overlay" 
      ref={overlayRef}
      style={{ cursor: 'default' }}
    >
      <div className="modal-content modal-small" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="modal-header">
          <h2>Código QR de la tarjeta</h2>
          <button className="modal-close" onClick={handleCloseQrModal}>×</button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Escanea este código QR para acceder a la tarjeta
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(13,184,211,0.07)', 
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--primary-light)',
              wordBreak: 'break-all',
            }}>
              <code style={{ flex: 1, fontSize: '0.7rem', wordBreak: 'break-all' }}>
                {getCurrentUrl()}
              </code>
              <button
                onClick={handleCopyUrl}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  transition: 'var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13,184,211,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Copy size={14} />
                Copiar
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            background: 'rgba(31,41,55,0.3)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem'
          }}>
            {qrLoading ? (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Generando código QR...</p>
              </div>
            ) : qrError ? (
              <div style={{ textAlign: 'center', color: 'var(--warning)', maxWidth: '280px' }}>
                <QrCode size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>⚠️ {qrError}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  La URL de tu tarjeta es: <br />
                  <code style={{ wordBreak: 'break-all' }}>{getCurrentUrl()}</code>
                </p>
                <button 
                  className="btn-small"
                  onClick={handleCopyUrl}
                  style={{ marginTop: '0.5rem' }}
                >
                  Copiar URL
                </button>
              </div>
            ) : qrImageUrl ? (
              <img 
                src={qrImageUrl} 
                alt="Código QR de la tarjeta"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <QrCode size={48} />
                <p>Preparando código QR...</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          {qrImageUrl && (
            <button 
              className="btn-primary"
              onClick={handleDownloadQr}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={16} />
              Descargar QR
            </button>
          )}
          <button className="btn-secondary" onClick={handleCloseQrModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnuncioModal = () => (
    <div className="modal-overlay" ref={anuncioOverlayRef} onClick={handleAnuncioOverlayClick}>
      <div className="modal-content" style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }}>
        <button 
          className="modal-close" 
          onClick={handleCloseAnuncioModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <img 
              src="/llavero.png" 
              alt="Llavero con QR personalizado"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                console.error('Error loading image:', e);
              }}
            />
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{
                background: 'var(--primary-gradient)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'white',
                display: 'inline-block',
              }}>
                ¡Oferta Especial!
              </span>
            </div>
            
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              Lleva tu QR a todas partes
            </h2>
            
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem', 
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              Usa el QR que generaste para imprimirlo en una ficha 3D que tus clientes y compañeros siempre puedan escanear.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Diseño 3D personalizado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Material resistente</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Envío a toda la República</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/*<a 
                href="https://wa.me/523326239790?text=Hola%2C%20me%20interesa%20adquirir%20una%20ficha%203D%20con%20mi%20c%C3%B3digo%20QR%20personalizado"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'var(--transition-base)',
                }}
              >
                <ShoppingBag size={18} />
                Solicitar por WhatsApp
              </a>*/}
              <button 
                className="btn-secondary" 
                onClick={handleCloseAnuncioModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                }}
              >
                Ahora no
              </button>
            </div>
            
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)' 
            }}>
              *Oferta válida por tiempo limitado
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <div className="tarjeta-publica-page" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: 'var(--spacing-xl)',
      }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <div className="public-card">
            <div className="public-card-header plantillas-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h1>{tarjeta.nombre_tarjeta}</h1>
              <button 
                className="btn-qr"
                onClick={handleOpenQrModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'var(--transition-base)',
                }}
              >
                <QrCode size={16} />
                Generar QR
              </button>
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

      {qrModalOpen && renderQrModal()}
      {anuncioModalOpen && renderAnuncioModal()}
    </>
  );

  if (!isAuthenticated) {
    return renderContent();
  }

  return (
    <>
      <div className="tarjeta-publica-page">
        <div className="container">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="public-card">
            <div className="public-card-header plantillas-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1>{tarjeta.nombre_tarjeta}</h1>
                <div className="public-meta" style={{ marginTop: '0.5rem' }}>
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
              <button 
                className="btn-qr"
                onClick={handleOpenQrModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'var(--transition-base)',
                }}
              >
                <QrCode size={16} />
                Generar código QR
              </button>
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

      {qrModalOpen && renderQrModal()}
      {anuncioModalOpen && renderAnuncioModal()}
    </>
  );
};

export default TarjetaPublicaPage;