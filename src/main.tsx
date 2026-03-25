// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import './styles/custom-bootstrap.scss';

// Registrar Service Worker para PWA (opcional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

// Prevenir scroll en body cuando se abre modal
const rootElement = document.getElementById('root');
if (rootElement) {
  // Remover el loading inicial cuando la app esté montada
  const removeInitialLoading = () => {
    const loadingElement = document.getElementById('initial-loading');
    if (loadingElement) {
      loadingElement.style.opacity = '0';
      setTimeout(() => {
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.remove();
        }
      }, 300);
    }
  };
  
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
  
  // Remover loading después de que React monte
  setTimeout(removeInitialLoading, 100);
}

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);