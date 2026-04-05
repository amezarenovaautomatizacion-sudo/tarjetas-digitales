import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, Container, Nav, Offcanvas, NavDropdown } from 'react-bootstrap';
import { 
  House, 
  Grid, 
  CreditCard, 
  LayoutGrid, 
  User, 
  LogOut,
  Menu,
  Crown,
  X,
  ChevronRight,
  Sparkles,
  Settings,
  HelpCircle
} from 'lucide-react';
import LogoSvg from '/Logo.svg';

interface LayoutProps {
  children: React.ReactNode;
  userType: string | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onNavigate: (page: string, id?: number, slug?: string) => void;
  currentPage: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
  badge?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userType, 
  isAuthenticated, 
  onLogout, 
  onNavigate,
  currentPage 
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSidebar]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSidebar) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showSidebar]);

  const menuItems: MenuItem[] = useMemo(() => [
    { 
      id: 'home', 
      label: 'Inicio', 
      icon: House, 
      visible: true,
      description: 'Ver todas las plantillas disponibles'
    },
    { 
      id: 'plantillas', 
      label: 'Plantillas', 
      icon: LayoutGrid, 
      visible: true,
      description: 'Explora nuestras plantillas profesionales'
    },
    { 
      id: 'precios', 
      label: 'Planes y Precios', 
      icon: Crown, 
      visible: true,
      badge: 'Nuevo',
      description: 'Elige el plan que mejor se adapte a ti'
    },
    { 
      id: 'dashboard', 
      label: 'Mis Tarjetas', 
      icon: CreditCard, 
      visible: isAuthenticated,
      description: 'Gestiona tus tarjetas digitales'
    },
    { 
      id: 'admin-plantillas', 
      label: 'Admin Plantillas', 
      icon: Grid, 
      visible: isAuthenticated && userType === 'admin',
      description: 'Panel de administración de plantillas'
    },
    { 
      id: 'perfil', 
      label: 'Mi Perfil', 
      icon: User, 
      visible: isAuthenticated,
      description: 'Configura tu información personal'
    },
  ], [isAuthenticated, userType]);

  const handleNavigation = useCallback((page: string) => {
    onNavigate(page);
    setShowSidebar(false);
  }, [onNavigate]);

  const renderSidebarItems = useMemo(() => (
    <>
      {menuItems.filter(item => item.visible).map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <div
            key={item.id}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavigation(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation(item.id);
              }
            }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            data-tooltip={item.description}
            onMouseEnter={() => setActiveTooltip(item.id)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Icon size={20} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
            {item.badge && (
              <span className="sidebar-badge">{item.badge}</span>
            )}
            {isActive && <ChevronRight size={16} className="sidebar-active-indicator" />}
          </div>
        );
      })}
    </>
  ), [menuItems, currentPage, handleNavigation]);

  const renderSidebarContent = useMemo(() => (
    <>
      <div className="sidebar-menu">
        {renderSidebarItems}
        
        {isAuthenticated && (
          <>
            <div className="sidebar-divider" />
            
            <div className="sidebar-section-title">
              <HelpCircle size={14} />
              <span>Soporte</span>
            </div>
            
            <div 
              className="sidebar-item support-item"
              onClick={() => window.open('/ayuda', '_blank')}
              role="button"
              tabIndex={0}
            >
              <HelpCircle size={20} className="sidebar-icon" />
              <span className="sidebar-label">Centro de Ayuda</span>
            </div>
            
            <div className="sidebar-divider" />
            
            <div 
              className="sidebar-item logout" 
              onClick={onLogout}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onLogout();
                }
              }}
            >
              <LogOut size={20} className="sidebar-icon" />
              <span className="sidebar-label">Cerrar Sesión</span>
            </div>
          </>
        )}
      </div>
      
      <div className="sidebar-footer">
        {userType && (
          <div className="sidebar-user-badge">
            <Sparkles size={14} />
            <span>{userType === 'admin' ? 'Administrador' : 'Cliente'}</span>
          </div>
        )}
        <div className="sidebar-version">
          <small>v2.0.0</small>
        </div>
      </div>
    </>
  ), [isAuthenticated, renderSidebarItems, onLogout, userType]);

  return (
    <div className="app-wrapper">
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand={false} 
        className={`top-navbar ${scrolled ? 'scrolled' : ''}`} 
        fixed="top"
      >
        <Container fluid>
          <Navbar.Brand 
            onClick={() => handleNavigation('home')} 
            className="navbar-brand-custom"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation('home');
              }
            }}
          >
            <img 
              src={LogoSvg} 
              alt="TapCards" 
              className="navbar-logo"
              height="40"
              width="auto"
            />
            <span className="brand-text">
              <span className="brand-tap">Tap</span>
              <span className="brand-cards">Cards</span>
            </span>
            <span className="brand-badge">Beta</span>
          </Navbar.Brand>
          
          <Nav className="ms-auto align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Nav.Link 
                  onClick={() => handleNavigation('login')} 
                  className="nav-link-custom"
                >
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link 
                  onClick={() => handleNavigation('register')} 
                  className="btn-register-nav"
                >
                  Registrarse
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  onClick={() => handleNavigation('dashboard')} 
                  className="nav-icon-link"
                  aria-label="Mis Tarjetas"
                >
                  <CreditCard size={18} />
                </Nav.Link>
                
                <NavDropdown 
                  title={
                    <div className="user-avatar">
                      <User size={18} />
                    </div>
                  } 
                  id="user-dropdown" 
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item onClick={() => handleNavigation('perfil')} className="dropdown-item-custom">
                    <User size={16} className="me-2" /> 
                    <span>Mi Perfil</span>
                  </NavDropdown.Item>
                  
                  {userType === 'admin' && (
                    <>
                      <NavDropdown.Item onClick={() => handleNavigation('admin-plantillas')} className="dropdown-item-custom">
                        <Settings size={16} className="me-2" /> 
                        <span>Administración</span>
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  )}
                  
                  <NavDropdown.Item onClick={onLogout} className="dropdown-item-custom logout-item">
                    <LogOut size={16} className="me-2" /> 
                    <span>Cerrar Sesión</span>
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
            
            <button 
              className="menu-trigger"
              onClick={() => setShowSidebar(true)}
              aria-label="Abrir menú"
              aria-expanded={showSidebar}
            >
              <Menu size={20} />
            </button>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)} 
        placement="end"
        className="sidebar-offcanvas"
        backdropClassName="sidebar-backdrop"
      >
        <Offcanvas.Header className="sidebar-header">
          <Offcanvas.Title>
            <div className="sidebar-logo">
              <img 
                src={LogoSvg} 
                alt="TapCards" 
                className="sidebar-logo-img"
                height="32"
                width="auto"
              />
              <span className="sidebar-brand-text">
                <span className="sidebar-brand-tap">Tap</span>
                <span className="sidebar-brand-cards">Cards</span>
              </span>
            </div>
          </Offcanvas.Title>
          <button 
            className="btn-close-custom" 
            onClick={() => setShowSidebar(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="sidebar-body">
          {renderSidebarContent}
        </Offcanvas.Body>
      </Offcanvas>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;