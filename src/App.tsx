<<<<<<< HEAD
// src/App.tsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlantillasPage from './pages/PlantillasPage';
import PricingPlans from './components/PricingPlans';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlantillaDetailPage from './pages/PlantillaDetailPage';
import TarjetaPublicaPage from './pages/TarjetaPublicaPage';
import AdminPlantillasPage from './pages/AdminPlantillasPage';
import PerfilPage from './pages/PerfilPage';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';
import './styles/custom-bootstrap.scss';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('userType');
    if (token && type) {
      setUserType(type);
=======
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
>>>>>>> 2634bf75981fad12df94b7be0bf98ad22bef4040
    }
  }, []);

  const navigateTo = (page: string, plantillaId?: number, slug?: string) => {
    setCurrentPage(page);
    if (plantillaId) setSelectedPlantillaId(plantillaId);
    if (slug) setSelectedSlug(slug);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setUserType(null);
    navigateTo('home');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} />;
      case 'plantillas':
        return <PlantillasPage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} />;
      case 'precios':
        return <PricingPlans />;
      case 'login':
        return <LoginPage onLoginSuccess={(type) => { setUserType(type); navigateTo('dashboard'); }} />;
      case 'register':
        return <RegisterPage onRegisterSuccess={() => navigateTo('login')} />;
      case 'dashboard':
        return <DashboardPage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} onTarjetaPublicaClick={(slug) => navigateTo('tarjeta-publica', undefined, slug)} />;
      case 'admin-plantillas':
        return userType === 'admin' ? <AdminPlantillasPage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} /> : <HomePage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} />;
      case 'plantilla-detail':
        return selectedPlantillaId ? <PlantillaDetailPage plantillaId={selectedPlantillaId} onBack={() => navigateTo('plantillas')} /> : null;
      case 'tarjeta-publica':
        return selectedSlug ? <TarjetaPublicaPage slug={selectedSlug} onBack={() => navigateTo('home')} /> : null;
      case 'perfil':
        return <PerfilPage onBack={() => navigateTo('dashboard')} />;
      default:
        return <HomePage onPlantillaClick={(id) => navigateTo('plantilla-detail', id)} />;
    }
  };

 


  return (
<<<<<<< HEAD
    <ErrorBoundary>
      <Layout
        userType={userType}
        isAuthenticated={!!userType}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        currentPage={currentPage}
      >
        {renderContent()}
      </Layout>
    </ErrorBoundary>
=======
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
>>>>>>> 2634bf75981fad12df94b7be0bf98ad22bef4040
  );
};

export default App;