import React, { useState, useEffect, useRef } from 'react';
import { Eye, FileText, Link, ArrowLeft, QrCode, Download, X } from 'lucide-react';
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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Obtener la URL actual de la tarjeta pública
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

  const handleOpenQrModal = async () => {
    setQrModalOpen(true);
    setQrLoading(true);
    setQrError('');
    setQrImageUrl(null);

    try {
      const url = getCurrentUrl();
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

      // Convertir la respuesta a blob y crear URL de imagen
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
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleCloseQrModal();
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

  // Vista para usuarios no autenticados (pública)
  if (!isAuthenticated) {
    return (
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

        {/* Modal de QR */}
        {qrModalOpen && (
          <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-content modal-small" style={{ maxWidth: 480, textAlign: 'center' }}>
              <div className="modal-header">
                <h2>Código QR de la tarjeta</h2>
                <button className="modal-close" onClick={handleCloseQrModal}>×</button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Escanea este código QR para acceder a la tarjeta
                  </p>
                  <p style={{ 
                    background: 'rgba(13,184,211,0.07)', 
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: 'var(--primary-light)',
                    wordBreak: 'break-all',
                    marginTop: '0.5rem'
                  }}>
                    {getCurrentUrl()}
                  </p>
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
                    <div style={{ textAlign: 'center', color: 'var(--danger)' }}>
                      <p>❌ {qrError}</p>
                      <button 
                        className="btn-small"
                        onClick={handleOpenQrModal}
                        style={{ marginTop: '0.5rem' }}
                      >
                        Reintentar
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
        )}
      </>
    );
  }

  // Vista para usuarios autenticados (dueño)
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

      {/* Modal de QR */}
      {qrModalOpen && (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
          <div className="modal-content modal-small" style={{ maxWidth: 480, textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Código QR de la tarjeta</h2>
              <button className="modal-close" onClick={handleCloseQrModal}>×</button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Escanea este código QR para acceder a la tarjeta
                </p>
                <p style={{ 
                  background: 'rgba(13,184,211,0.07)', 
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: 'var(--primary-light)',
                  wordBreak: 'break-all',
                  marginTop: '0.5rem'
                }}>
                  {getCurrentUrl()}
                </p>
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
                  <div style={{ textAlign: 'center', color: 'var(--danger)' }}>
                    <p>❌ {qrError}</p>
                    <button 
                      className="btn-small"
                      onClick={handleOpenQrModal}
                      style={{ marginTop: '0.5rem' }}
                    >
                      Reintentar
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
      )}
    </>
  );
};

export default TarjetaPublicaPage;