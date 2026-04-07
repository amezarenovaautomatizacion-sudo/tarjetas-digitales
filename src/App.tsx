import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlantillasPage from './pages/PlantillasPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterAdminPage from './pages/RegisterAdminPage';
import DashboardPage from './pages/DashboardPage';
import PlantillaDetailPage from './pages/PlantillaDetailPage';
import TarjetaPublicaPage from './pages/TarjetaPublicaPage';
import AdminPlantillasPage from './pages/AdminPlantillasPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminVariablesPage from './pages/AdminVariablesPage';
import AdminCategoriasPage from './pages/AdminCategoriasPage';
import AdminLogsPage from './pages/AdminLogsPage';
import PerfilPage from './pages/PerfilPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EditarTarjetaPage from './pages/EditarTarjetaPage';
import PlanesPage from './pages/PlanesPage';
import AdminSuscripciones from './components/AdminSuscripciones';
import ErrorBoundary from './components/ErrorBoundary';
import useSessionTimeout from './hooks/useSessionTimeout';
import './styles/global.css';
import './styles/custom-bootstrap.scss';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<string | null>(() => {
    return localStorage.getItem('userType');
  });
  const [userRolid, setUserRolid] = useState<number | null>(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const data = JSON.parse(userData);
        return data.rolid;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (token && type) {
      setUserType(type);
      if (userData) {
        try {
          const data = JSON.parse(userData);
          setUserRolid(data.rolid);
        } catch (e) {}
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setUserType(null);
    setUserRolid(null);
    navigate('/');
  };

  useSessionTimeout(handleLogout);

  const handleNavigate = (page: string, id?: number, slug?: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'plantillas') navigate('/plantillas');
    else if (page === 'precios') navigate('/precios');
    else if (page === 'planes') navigate('/planes');
    else if (page === 'login') navigate('/login');
    else if (page === 'register') navigate('/register');
    else if (page === 'registerAdmin') navigate('/registro-admin');
    else if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'admin-plantillas') navigate('/admin/plantillas');
    else if (page === 'admin-usuarios') navigate('/admin/usuarios');
    else if (page === 'admin-dashboard') navigate('/admin/dashboard');
    else if (page === 'admin-variables') navigate('/admin/variables');
    else if (page === 'admin-categorias') navigate('/admin/categorias');
    else if (page === 'admin-logs') navigate('/admin/logs');
    else if (page === 'admin-suscripciones') navigate('/admin/suscripciones');
    else if (page === 'perfil') navigate('/perfil');
    else if (page === 'plantilla-detail' && id) navigate(`/plantilla/${id}`);
    else if (page === 'tarjeta-publica' && slug) navigate(`/tarjeta/${slug}`);
    else if (page === 'editar-tarjeta' && id) navigate(`/editar-tarjeta/${id}`);
  };

  const matchPlantilla = location.pathname.match(/^\/plantilla\/(\d+)$/);
  const matchTarjeta = location.pathname.match(/^\/tarjeta\/(.+)$/);
  const matchEditTarjeta = location.pathname.match(/^\/editar-tarjeta\/(\d+)$/);
  const matchResetAdmin = location.pathname.match(/^\/reset-password$/);
  const matchResetCliente = location.pathname.match(/^\/cliente\/reset-password$/);
  const matchForgotAdmin = location.pathname.match(/^\/forgot-password$/);
  const matchForgotCliente = location.pathname.match(/^\/cliente\/forgot-password$/);

  const isAdminRoute = () => {
    const adminPaths = [
      '/admin/plantillas',
      '/admin/usuarios',
      '/admin/dashboard',
      '/admin/variables',
      '/admin/categorias',
      '/admin/logs',
      '/admin/suscripciones'
    ];
    return adminPaths.some(path => location.pathname === path);
  };

  const isProtectedRoute = () => {
    const protectedPaths = [
      '/dashboard',
      '/perfil',
      '/editar-tarjeta'
    ];
    return protectedPaths.some(path => location.pathname.startsWith(path)) || isAdminRoute();
  };

  const hasAccessToRoute = () => {
    if (!isProtectedRoute()) return true;
    if (!userType) return false;
    if (isAdminRoute()) {
      return userType === 'admin' && userRolid === 1;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--primary)'
      }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '1rem' }}>Cargando...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (!hasAccessToRoute()) {
      return <Navigate to="/" replace />;
    }

    if (location.pathname === '/') {
      return <HomePage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
    }
    if (location.pathname === '/plantillas') {
      return <PlantillasPage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
    }
    if (location.pathname === '/precios') {
      return <PlanesPage />;
    }
    if (location.pathname === '/planes') {
      return <PlanesPage />;
    }
    if (location.pathname === '/login') {
      if (userType) {
        return <Navigate to="/dashboard" replace />;
      }
      return <LoginPage onLoginSuccess={(type, rolid) => { setUserType(type); setUserRolid(rolid); navigate('/dashboard'); }} />;
    }
    if (location.pathname === '/register') {
      if (userType) {
        return <Navigate to="/dashboard" replace />;
      }
      return <RegisterPage onRegisterSuccess={() => navigate('/login')} />;
    }
    if (location.pathname === '/registro-admin') {
      if (userType) {
        return <Navigate to="/dashboard" replace />;
      }
      return <RegisterAdminPage onRegisterSuccess={() => navigate('/login')} />;
    }
    if (matchResetAdmin) {
      return <ResetPasswordPage tipo="admin" />;
    }
    if (matchResetCliente) {
      return <ResetPasswordPage tipo="cliente" />;
    }
    if (matchForgotAdmin) {
      return <ForgotPasswordPage tipo="admin" />;
    }
    if (matchForgotCliente) {
      return <ForgotPasswordPage tipo="cliente" />;
    }
    if (location.pathname === '/dashboard') {
      if (!userType) {
        return <Navigate to="/login" replace />;
      }
      return <DashboardPage 
        onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} 
        onTarjetaPublicaClick={(slug) => handleNavigate('tarjeta-publica', undefined, slug)} 
      />;
    }
    if (location.pathname === '/admin/plantillas') {
      return <AdminPlantillasPage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
    }
    if (location.pathname === '/admin/usuarios') {
      return <AdminUsuariosPage />;
    }
    if (location.pathname === '/admin/dashboard') {
      return <AdminDashboardPage />;
    }
    if (location.pathname === '/admin/variables') {
      return <AdminVariablesPage />;
    }
    if (location.pathname === '/admin/categorias') {
      return <AdminCategoriasPage />;
    }
    if (location.pathname === '/admin/logs') {
      return <AdminLogsPage />;
    }
    if (location.pathname === '/admin/suscripciones') {
      return <AdminSuscripciones />;
    }
    if (location.pathname === '/perfil') {
      if (!userType) {
        return <Navigate to="/login" replace />;
      }
      return <PerfilPage onBack={() => handleNavigate('dashboard')} />;
    }
    if (matchEditTarjeta) {
      if (!userType) {
        return <Navigate to="/login" replace />;
      }
      return <EditarTarjetaPage onBack={() => handleNavigate('dashboard')} />;
    }
    if (matchPlantilla) {
      return <PlantillaDetailPage plantillaId={parseInt(matchPlantilla[1])} onBack={() => handleNavigate('plantillas')} />;
    }
    if (matchTarjeta) {
      return <TarjetaPublicaPage slug={matchTarjeta[1]} onBack={() => handleNavigate('home')} />;
    }
    
    return <HomePage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
  };

  return (
    <Layout
      userType={userType}
      userRolid={userRolid}
      isAuthenticated={!!userType}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
      currentPage={location.pathname}
    >
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;