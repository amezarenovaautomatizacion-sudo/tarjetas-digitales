import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import './styles/custom-bootstrap.scss';

// Registrar Service Worker para PWA (opcional)
const isProduction = import.meta.env.PROD;
if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

// Prevenir scroll en body cuando se abre modal
const rootElement = document.getElementById('root');
if (rootElement) {
  // Observer para manejar modales
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const hasModal = document.querySelector('.modal-overlay');
        if (hasModal) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  });
  
  observer.observe(rootElement, { childList: true, subtree: true });
}

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);