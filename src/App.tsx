import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import RegistroAdmin from './pages/RegistroAdmin';
import MiCuenta from './pages/MiCuenta';
import MisTarjetas from './pages/MisTarjetas';
import EditorTarjeta from './pages/EditorTarjetas';
import RecuperarPassword from './pages/RecuperarPassword';
import VistaTarjeta from './pages/VistaTarjeta';
import { useAuth } from './hooks/useAuth';
import { UsuarioData } from './types';
import './App.css';

type Vista = 'dashboard' | 'login' | 'registro' | 'cuenta' | 'mistarjetas'|'editortarjeta' |'recuperarpassword' | "vistatarjeta" | 'registro-admin';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const { usuario, login, logout, cargando } = useAuth();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null);
  const [tarjetaAEditar, setTarjetaAEditar] = useState<any | null>(null);
  const [tarjetaEnVistaPrevia, setTarjetaEnVistaPrevia] = useState<any | null>(null);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<any>(null);

  useEffect(() => {
    // Detectar el parámetro en la URL: localhost:3000/?setup=admin
    const queryParams = new URLSearchParams(window.location.search);
    
    if (queryParams.get('setup') === 'admin') {
      setVistaActual('registro-admin'); // Cambia a la vista que creamos
      
      // Opcional: Limpia la URL para que se vea limpia después de entrar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const manejarEditarTarjeta = (tarjeta: any) => {
    setTarjetaAEditar(tarjeta);      // Guardamos toda la info de la tarjeta
    setVistaActual('editortarjeta'); // Cambiamos a la vista del editor
  };

  const manejarVerTarjeta = (tarjeta: any) => {
    if (tarjeta && tarjeta.slug) {
      console.log("Abriendo vista para el slug:", tarjeta.slug); // Para depurar
      setTarjetaSeleccionada(tarjeta);
    } else {
      alert("Esta tarjeta no tiene un slug configurado en la base de datos.");
    }
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
            onEditarTarjeta={manejarEditarTarjeta}
            onVerTarjeta={manejarVerTarjeta}
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

      {vistaActual === 'registro-admin' && (
        <div className="page-container">
          <RegistroAdmin
            alFinalizar={() => setVistaActual('login')}
            irALogin={() => setVistaActual('login')}
          />
        </div>
      )}

      {vistaActual === 'editortarjeta' && (
        <div className="page-container">
          <EditorTarjeta 
            plantillaId={tarjetaAEditar ? tarjetaAEditar.plantillaid : plantillaSeleccionada}
            tarjetaId={tarjetaAEditar?.tarjetaclienteid}
            datosIniciales={tarjetaAEditar?.datos} 

            onVolver={() => {
                setVistaActual('dashboard');
                setTarjetaAEditar(null);
                setPlantillaSeleccionada(null); 
            }}
            usuario={usuario} 
            onIrAMisTarjetas={() => {
                setVistaActual('mistarjetas');
                setTarjetaAEditar(null);
            }}
            onIrACuenta={() => setVistaActual('cuenta')}
            onLogout={manejarLogout}
          />
        </div>
      )}
      
      {tarjetaSeleccionada && (
        <VistaTarjeta 
          slug={tarjetaSeleccionada.slug} 
          onCerrar={() => setTarjetaSeleccionada(null)} 
        />
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