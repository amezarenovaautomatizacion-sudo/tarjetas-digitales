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
  );
};

export default App;