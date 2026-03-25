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
import { plantillaService } from './services/plantilla.service';

type Vista = 'dashboard' | 'login' | 'registro' | 'cuenta' | 'mistarjetas'|'editortarjeta' |'recuperarpassword' | "vistatarjeta" | 'registro-admin' | 'publica';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const { usuario, login, logout, cargando } = useAuth();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null);
  const [tarjetaAEditar, setTarjetaAEditar] = useState<any | null>(null);
  const [tarjetaEnVistaPrevia, setTarjetaEnVistaPrevia] = useState<any | null>(null);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<any>(null);
  const {obtenerTarjetaPublica} = plantillaService;

   const manejarCargaPublica = async (slug: string) => {
    try {
      // 1. Llamada al servicio que ya tienes definido
      // Importante: Asegúrate de que 'obtenerTarjetaPublica' esté importada
      const response = await obtenerTarjetaPublica(slug);

      // 2. Extraer los datos (Axios suele envolverlos en .data)
      const tarjeta = response.data || response;

      // 3. Validación de seguridad: ¿Existe la tarjeta y tiene slug?
      if (tarjeta && (tarjeta.slug || tarjeta.id_slug)) {
        
        // Guardamos la tarjeta en el estado para que VistaTarjeta la lea
        setTarjetaEnVistaPrevia(tarjeta); 
        
        // Cambiamos la vista a 'publica' (Asegúrate de tenerla en tu Type)
        setVistaActual('publica'); 

        console.log(" Tarjeta cargada con éxito:", slug);
      } else {
        console.warn("El slug existe en la URL pero no en la base de datos.");
        setVistaActual('dashboard');
      }

    } catch (error: any) {
      // 4. Manejo de errores (ej: Error 401 o 404)
      console.error(" Error al cargar carga pública:", error.message);
      
      // Si la tarjeta no existe o hay error, mandamos al login por defecto
      setVistaActual('dashboard');
    }
  };
  

  useEffect(() => {
    // 1. Detectar parámetros de búsqueda (ej: ?setup=admin)
    const queryParams = new URLSearchParams(window.location.search);
    const setupParam = queryParams.get('setup');

    // 2. Detectar el slug en la ruta (ej: dominio.com/carlos-rodriguez)
    // Filtramos valores vacíos y nombres de rutas internas conocidas
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    const slugEnURL = pathParts[0]; 

    if (setupParam === 'admin') {
      // CASO A: Registro de Admin
      setVistaActual('registro-admin');
      window.history.replaceState({}, document.title, window.location.pathname);
    } 
    else if (slugEnURL && !['login', 'registro', 'dashboard'].includes(slugEnURL)) {
      // CASO B: Ver tarjeta de cliente por slug
      // Aquí es donde llamas a tu función que busca los datos en la API
      manejarCargaPublica(slugEnURL);
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
      
      {(tarjetaSeleccionada || tarjetaEnVistaPrevia) && (
        <VistaTarjeta 
          // Usamos el operador || para pasar la que esté disponible
          datos={tarjetaSeleccionada || tarjetaEnVistaPrevia} 
          slug={(tarjetaSeleccionada || tarjetaEnVistaPrevia).slug} 
          onCerrar={() => {
            setTarjetaSeleccionada(null);
            setTarjetaEnVistaPrevia(null);
            if (vistaActual === 'publica') setVistaActual('dashboard');
          }} 
        />
      )}

      {vistaActual === 'recuperarpassword' && (
        <div className="page-container">
          <RecuperarPassword 
            onVolver={() => setVistaActual('dashboard')} 
          />
        </div>
      )}
    </div>
  );
}

export default App;