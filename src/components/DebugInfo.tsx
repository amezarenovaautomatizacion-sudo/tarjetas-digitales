import React from 'react';

interface DebugInfoProps {
  plantillas: any[];
  loading: boolean;
  error: string | null;
  apiUrl: string;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ plantillas, loading, error, apiUrl }) => {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>API URL: {apiUrl}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Error: {error || 'None'}</div>
      <div>Plantillas: {plantillas.length}</div>
      {plantillas.length > 0 && (
        <div>Primera: {plantillas[0]?.nombre}</div>
      )}
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '5px',
          padding: '2px 5px',
          fontSize: '10px'
        }}
      >
        Recargar
      </button>
    </div>
  );
};

export default DebugInfo;