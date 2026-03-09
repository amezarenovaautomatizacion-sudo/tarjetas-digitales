import { useState } from 'react';
import Login from './pages/Login'; // Ajusta la ruta según donde estén tus archivos
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import './App.css';

// 1. Definimos la forma del objeto usuario
interface Usuario {
  email: string;
  nombre?: string;
}

// 2. Definimos los tipos de vistas posibles
type Vista = 'dashboard' | 'login' | 'registro';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const manejarLoginExitoso = (datos: Usuario) => {
    setUsuario(datos);
    setVistaActual('dashboard');
  };

  const manejarLogout = () => {
    setUsuario(null);
    setVistaActual('login');
  };

  return (
    <div className="App">
      {vistaActual === 'dashboard' && (
        <Dashboard 
          usuario={usuario} 
          onLogout={manejarLogout} 
          onSolicitarLogin={() => setVistaActual('login')} 
        />
      )}

      {vistaActual === 'login' && (
        <div className="page-container">
          <Login 
            onLogin={manejarLoginExitoso} 
            irARegistro={() => setVistaActual('registro')}
            irADashboard={() => setVistaActual('dashboard')}
          />
        </div>
      )}

      {vistaActual === 'registro' && (
        <div className="page-container">
          <Registro 
            alFinalizar={() => setVistaActual('login')} 
            irALogin={() => setVistaActual('login')}
          />
        </div>
      )}
    </div>
  );
}

export default App;