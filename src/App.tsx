import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import MisTarjetas from './pages/MisTarjetas';
import EditorTarjeta from './pages/EditorTarjetas';
import RecuperarPassword from './pages/RecuperarPassword';
import { useAuth } from './hooks/useAuth';
import { UsuarioData } from './types';
import './App.css';

type Vista = 'dashboard' | 'login' | 'registro' | 'cuenta' | 'mistarjetas'|'editortarjeta' |'recuperarpassword';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const { usuario, login, logout, cargando } = useAuth();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null);

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

  const entrarAlEditor = (id: number) => {
    setPlantillaSeleccionada(id);
    setVistaActual('editortarjeta');
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
          onSeleccionarPlantilla={entrarAlEditor}
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

      {vistaActual === 'editortarjeta' && plantillaSeleccionada && (
        <div className="page-container">
          <EditorTarjeta 
            plantillaId={plantillaSeleccionada}
            onVolver={() => setVistaActual('dashboard')}
            // AGREGA ESTAS LÍNEAS QUE SON LAS QUE FALTAN:
            usuario={usuario} 
            onIrAMisTarjetas={() => setVistaActual('mistarjetas')}
            onIrACuenta={() => setVistaActual('cuenta')}
            onLogout={manejarLogout}
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