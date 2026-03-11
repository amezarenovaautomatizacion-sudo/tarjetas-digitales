import { useState } from 'react';
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta'; 
import './App.css';

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

  // Función para navegar a la cuenta
  const irACuenta = () => {
    if (usuario) setVistaActual('cuenta');
    else setVistaActual('login');
  };

  return (
    <div className="App">
      {/* VISTA DASHBOARD */}
      {vistaActual === 'dashboard' && (
        <Dashboard
          usuario={usuario}
          onLogout={manejarLogout}
          onSolicitarLogin={() => setVistaActual('login')}
          onIrACuenta={irACuenta} // Nueva prop para el botón del correo
        />
      )}
      
      {/* VISTA MI CUENTA */}
      {vistaActual === 'cuenta' && usuario && (
        <MiCuenta 
          usuarioActual={usuario} 
          onLogout={manejarLogout}
          onVolver={() => setVistaActual('dashboard')}
        />
      )}

      {/* VISTA LOGIN */}
      {vistaActual === 'login' && (
        <div className="page-container">
          <Login
            onLogin={manejarLoginExitoso}
            irARegistro={() => setVistaActual('registro')}
            irADashboard={() => setVistaActual('dashboard')}
          />
        </div>
      )}

      {/* VISTA REGISTRO */}
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