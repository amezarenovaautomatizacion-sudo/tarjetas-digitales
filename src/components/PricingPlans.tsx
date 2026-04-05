import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs } from 'react-bootstrap';
import { 
  CheckCircle, 
  Star, 
  Users, 
  Building2, 
  Zap, 
  Shield,
  Clock,
  FileText,
  Share2,
  BarChart,
  Headphones,
  Sparkles
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  segment: string;
  price: number;
  priceLabel: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  custom?: boolean;
  badge?: string;
  gradient?: string;
}

const PricingPlans: React.FC = () => {
  const [activeTab, setActiveTab] = useState('b2c');

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Básico',
      segment: 'B2C',
      price: 0,
      priceLabel: 'Gratis',
      icon: <Star size={32} />,
      features: [
        'Hasta 3 tarjetas digitales',
        'Plantillas básicas',
        'Visibilidad pública',
        'Soporte por email',
        'Compartir en redes sociales',
        'Estadísticas básicas'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      segment: 'B2C',
      price: 130,
      priceLabel: '/mes',
      icon: <Sparkles size={32} />,
      popular: true,
      badge: 'Más Popular',
      gradient: 'premium-gradient',
      features: [
        'Tarjetas ilimitadas',
        'Todas las plantillas',
        'Análisis avanzado',
        'Soporte prioritario',
        'Personalización completa',
        'Exportar a PDF',
        'Códigos QR personalizados',
        'Sin publicidad'
      ]
    },
    {
      id: 'smb',
      name: 'Negocios',
      segment: 'SMB',
      price: 200,
      priceLabel: '/mes',
      icon: <Users size={32} />,
      badge: 'Recomendado',
      features: [
        'Hasta 50 tarjetas',
        '5 usuarios permitidos',
        'Gestión de equipo',
        'API de integración',
        'Reportes ejecutivos',
        'Branding personalizado',
        'Soporte 24/7',
        'Análisis por equipo'
      ]
    },
    {
      id: 'smb-plus',
      name: 'Negocios Pro',
      segment: 'SMB',
      price: 300,
      priceLabel: '/mes',
      icon: <Building2 size={32} />,
      features: [
        'Tarjetas ilimitadas',
        '10 usuarios permitidos',
        'Todo lo de Negocios',
        'Automatización avanzada',
        'Integración CRM',
        'Diseños exclusivos',
        'Training incluido',
        'SLA garantizado'
      ]
    },
    {
      id: 'enterprise',
      name: 'Corporativo',
      segment: 'B2B',
      price: 0,
      priceLabel: 'Cotización',
      icon: <Building2 size={32} />,
      custom: true,
      features: [
        'Soluciones personalizadas',
        'Usuarios ilimitados',
        'Implementación dedicada',
        'Seguridad empresarial',
        'Soporte dedicado',
        'API personalizada',
        'Onboarding exclusivo',
        'SLA premium'
      ]
    }
  ];

  const enterpriseBenefits = [
    { icon: Shield, text: 'Seguridad de nivel empresarial', description: 'Encriptación avanzada y cumplimiento normativo' },
    { icon: Zap, text: 'Escalabilidad automática', description: 'Infraestructura que crece con tu negocio' },
    { icon: Headphones, text: 'Soporte dedicado 24/7', description: 'Gerente de cuenta exclusivo' },
    { icon: BarChart, text: 'Analytics avanzado', description: 'Dashboards personalizados y KPIs' }
  ];

  const renderPlanCard = (plan: Plan) => (
    <Col lg={plan.segment === 'B2B' ? 12 : 6} xl={plan.segment === 'B2B' ? 12 : 4} key={plan.id} className="mb-4">
      <Card className={`pricing-card h-100 ${plan.popular ? 'popular-card' : ''} ${plan.gradient ? plan.gradient : ''}`}>
        {plan.badge && (
          <div className="plan-badge">
            <Badge bg="warning" text="dark">{plan.badge}</Badge>
          </div>
        )}
        <Card.Body className="text-center">
          <div className="plan-icon mb-3">
            {plan.icon}
          </div>
          <Card.Title className="plan-name">{plan.name}</Card.Title>
          <Card.Subtitle className="plan-segment mb-3">{plan.segment}</Card.Subtitle>
          <div className="plan-price">
            {plan.custom ? (
              <span className="price-custom">{plan.priceLabel}</span>
            ) : (
              <>
                <span className="price-currency">$</span>
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.priceLabel}</span>
              </>
            )}
          </div>
          <Button 
            variant={plan.popular ? 'warning' : 'outline-primary'} 
            className={`mt-3 w-100 ${plan.popular ? 'btn-popular' : ''}`}
            onClick={() => alert('Funcionalidad de contratación')}
          >
            {plan.price === 0 && !plan.custom ? 'Comenzar Gratis' : plan.custom ? 'Solicitar Cotización' : 'Contratar Ahora'}
          </Button>
        </Card.Body>
        <Card.Footer className="bg-transparent border-top-0">
          <div className="features-list">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <CheckCircle size={16} className="feature-check" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );

  return (
    <div className="pricing-plans-page">
      <div className="pricing-hero">
        <Container>
          <h1 className="pricing-title">Planes y Precios</h1>
          <p className="pricing-subtitle">
            Elige el plan perfecto para tus necesidades. Todos los planes incluyen acceso a nuestras plantillas profesionales.
          </p>
        </Container>
      </div>

      <Container className="py-5">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'b2c')}
          className="pricing-tabs mb-5 justify-content-center"
        >
          <Tab eventKey="b2c" title="👤 Para Personas">
            <div className="mt-4">
              <Row>
                {plans.filter(p => p.segment === 'B2C').map(renderPlanCard)}
              </Row>
              <div className="comparison-table mt-5">
                <h4 className="text-center mb-4">Comparativa de Características</h4>
                <Row>
                  <Col md={6} className="mx-auto">
                    <div className="comparison-card">
                      <div className="comparison-header">
                        <span>Característica</span>
                        <span>Básico</span>
                        <span>Premium</span>
                      </div>
                      <div className="comparison-row">
                        <span>Tarjetas digitales</span>
                        <span>3</span>
                        <span>Ilimitadas</span>
                      </div>
                      <div className="comparison-row">
                        <span>Plantillas disponibles</span>
                        <span>5</span>
                        <span>Todas</span>
                      </div>
                      <div className="comparison-row">
                        <span>Análisis avanzado</span>
                        <span>✗</span>
                        <span>✓</span>
                      </div>
                      <div className="comparison-row">
                        <span>Soporte prioritario</span>
                        <span>✗</span>
                        <span>✓</span>
                      </div>
                      <div className="comparison-row">
                        <span>Códigos QR personalizados</span>
                        <span>✗</span>
                        <span>✓</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Tab>
          <Tab eventKey="smb" title="🏢 Para Negocios">
            <div className="mt-4">
              <Row>
                {plans.filter(p => p.segment === 'SMB').map(renderPlanCard)}
              </Row>
            </div>
          </Tab>
          <Tab eventKey="b2b" title="🏛️ Empresas">
            <div className="mt-4">
              <Row>
                {plans.filter(p => p.segment === 'B2B').map(renderPlanCard)}
              </Row>
              <Row className="mt-5">
                <Col>
                  <Card className="enterprise-card">
                    <Card.Body className="text-center">
                      <h3 className="mb-4">¿Necesitas algo más personalizado?</h3>
                      <p className="mb-4">
                        Ofrecemos soluciones empresariales adaptadas a tus necesidades específicas.
                        Contáctanos para una cotización personalizada.
                      </p>
                      <Button variant="primary" size="lg" onClick={() => alert('Contacto')}>
                        Contactar a Ventas
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="mt-5">
                <h4 className="text-center mb-4">Beneficios Corporativos</h4>
                {enterpriseBenefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <Col md={3} key={idx} className="mb-4">
                      <div className="benefit-card text-center">
                        <div className="benefit-icon">
                          <Icon size={40} />
                        </div>
                        <h5>{benefit.text}</h5>
                        <p className="text-muted small">{benefit.description}</p>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Tab>
        </Tabs>

        <div className="faq-section mt-5 pt-5">
          <h3 className="text-center mb-4">Preguntas Frecuentes</h3>
          <Row>
            <Col md={6}>
              <div className="faq-item">
                <h6>¿Puedo cambiar de plan en cualquier momento?</h6>
                <p className="text-muted">Sí, puedes actualizar o cancelar tu plan cuando lo necesites. Los cambios se aplican en tu próximo ciclo de facturación.</p>
              </div>
              <div className="faq-item mt-3">
                <h6>¿Ofrecen descuentos por pago anual?</h6>
                <p className="text-muted">Sí, ofrecemos 2 meses gratis al contratar el plan anual. Contacta con nosotros para más información.</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="faq-item">
                <h6>¿Hay período de prueba?</h6>
                <p className="text-muted">Ofrecemos 14 días de prueba gratuita en todos los planes para que puedas probar todas las funcionalidades.</p>
              </div>
              <div className="faq-item mt-3">
                <h6>¿Qué métodos de pago aceptan?</h6>
                <p className="text-muted">Aceptamos tarjetas de crédito/débito, transferencia bancaria y PayPal.</p>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default PricingPlans;