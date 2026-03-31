import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';
import './styles/custom-bootstrap.scss';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('userType');
    if (token && type) {
      setUserType(type);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setUserType(null);
    navigate('/');
  };

  const handleNavigate = (page: string, id?: number, slug?: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'plantillas') navigate('/plantillas');
    else if (page === 'precios') navigate('/precios');
    else if (page === 'login') navigate('/login');
    else if (page === 'register') navigate('/register');
    else if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'admin-plantillas') navigate('/admin/plantillas');
    else if (page === 'perfil') navigate('/perfil');
    else if (page === 'plantilla-detail' && id) navigate(`/plantilla/${id}`);
    else if (page === 'tarjeta-publica' && slug) navigate(`/tarjeta/${slug}`);
  };

  const matchPlantilla = location.pathname.match(/^\/plantilla\/(\d+)$/);
  const matchTarjeta = location.pathname.match(/^\/tarjeta\/(.+)$/);
  const matchResetAdmin = location.pathname.match(/^\/reset-password$/);
  const matchResetCliente = location.pathname.match(/^\/cliente\/reset-password$/);
  const matchForgotAdmin = location.pathname.match(/^\/forgot-password$/);
  const matchForgotCliente = location.pathname.match(/^\/cliente\/forgot-password$/);

  const renderContent = () => {
    if (location.pathname === '/') {
      return <HomePage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
    }
    if (location.pathname === '/plantillas') {
      return <PlantillasPage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} />;
    }
    if (location.pathname === '/precios') {
      return <PricingPlans />;
    }
    if (location.pathname === '/login') {
      return <LoginPage onLoginSuccess={(type) => { setUserType(type); navigate('/dashboard'); }} />;
    }
    if (location.pathname === '/register') {
      return <RegisterPage onRegisterSuccess={() => navigate('/login')} />;
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
      return <DashboardPage 
        onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} 
        onTarjetaPublicaClick={(slug) => handleNavigate('tarjeta-publica', undefined, slug)} 
      />;
    }
    if (location.pathname === '/admin/plantillas') {
      return userType === 'admin' ? 
        <AdminPlantillasPage onPlantillaClick={(id) => handleNavigate('plantilla-detail', id)} /> : 
        <Navigate to="/" />;
    }
    if (location.pathname === '/perfil') {
      return <PerfilPage onBack={() => handleNavigate('dashboard')} />;
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