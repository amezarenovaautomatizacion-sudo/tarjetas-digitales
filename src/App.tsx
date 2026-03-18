import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import MisTarjetas from './pages/MisTarjetas';
import RecuperarPassword from './pages/RecuperarPassword';
import { useAuth } from './hooks/useAuth';
import { UsuarioData } from './types';
import './App.css';

type Vista = 'dashboard' | 'login' | 'registro' | 'cuenta' | 'mistarjetas' |'recuperarpassword';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const { usuario, login, logout, cargando } = useAuth();

  if (cargando) {
    return <div className="cargando-container">Cargando...</div>;
  }

  const manejarLoginExitoso = (datos: UsuarioData) => {
    localStorage.setItem('usuario', JSON.stringify(datos));
    setVistaActual('dashboard');
  };

  const manejarLogout = () => {
    logout();
    setVistaActual('login');
  };

  const irACuenta = () => {
    if (usuario) setVistaActual('cuenta');
    else setVistaActual('login');
  };

  return (
    <div className="App">
      {vistaActual === 'dashboard' && (
        <Dashboard
          usuario={usuario}
          onLogout={manejarLogout}
          onSolicitarLogin={() => setVistaActual('login')}
          onIrACuenta={irACuenta}
          onIrAMisTarjetas={() => setVistaActual('mistarjetas')}
        />
      )}
      
      {vistaActual === 'cuenta' && usuario && (
        <MiCuenta 
          usuarioActual={usuario} 
          onLogout={manejarLogout}
          onVolver={() => setVistaActual('dashboard')}
          onIrAMisTarjetas={() => setVistaActual('mistarjetas')}
        />
      )}

      {vistaActual === 'login' && (
        <div className="page-container">
          <Login
            onLogin={manejarLoginExitoso}
            irARegistro={() => setVistaActual('registro')}
            irADashboard={() => setVistaActual('dashboard')}
            irARecuperarPassword={() => setVistaActual('recuperarpassword')}
          />
        </div>
      )}

      {vistaActual === 'mistarjetas' && (
        <div className="page-container">
          <MisTarjetas
            usuario={usuario} 
            onLogout={manejarLogout}
            onSolicitarLogin={() => setVistaActual('login')}
            onIrACuenta={irACuenta}
            onIrADashboard={() => setVistaActual('dashboard')} 
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

      {vistaActual === 'recuperarpassword' && (
        <div className="page-container">
          <RecuperarPassword 
            onVolver={() => setVistaActual('login')} 
          />
        </div>
      )}
    </div>
  );
}

export default App;