// src/components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Cargando...</p>
  </div>
);

export default LoadingSpinner;