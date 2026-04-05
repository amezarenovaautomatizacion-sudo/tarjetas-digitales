import React from 'react';
import LogoSvg from '/Logo.svg';

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner-simple">
    <img 
      src={LogoSvg} 
      alt="TapCards" 
      className="loading-logo-simple"
    />
    <div className="loading-progress-bar">
      <div className="loading-progress-fill"></div>
    </div>
    <p className="loading-message">Cargando TapCards...</p>
  </div>
);

export default LoadingSpinner;