import React, { useState } from 'react';
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
  BarChart,
  Headphones,
  Sparkles,
  Rocket,
  HelpCircle,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  segment: 'B2C' | 'SMB' | 'B2B';
  price: number;
  priceLabel: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  badge?: string;
  buttonText?: string;
  annualDiscount?: string;
}

const PricingPlans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('b2c');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Básico',
      segment: 'B2C',
      price: 0,
      priceLabel: 'Gratis',
      icon: <Star size={28} strokeWidth={1.5} />,
      buttonText: 'Comenzar Gratis',
      features: [
        '3 tarjetas digitales',
        'Plantillas esenciales',
        'Visibilidad pública',
        'Soporte por email',
        'Compartir en redes',
        'Estadísticas básicas',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      segment: 'B2C',
      price: 130,
      priceLabel: '/mes',
      icon: <Sparkles size={28} strokeWidth={1.5} />,
      popular: true,
      badge: 'Más Popular',
      buttonText: 'Contratar Ahora',
      annualDiscount: 'Ahorra 2 meses',
      features: [
        'Tarjetas ilimitadas',
        'Todas las plantillas',
        'Análisis avanzado',
        'Soporte prioritario 24/7',
        'Personalización completa',
        'Exportar a PDF',
        'Códigos QR personalizados',
        'Sin publicidad',
      ],
    },
    {
      id: 'business',
      name: 'Negocios',
      segment: 'SMB',
      price: 200,
      priceLabel: '/mes',
      icon: <Users size={28} strokeWidth={1.5} />,
      badge: 'Para Equipos',
      buttonText: 'Contratar Ahora',
      annualDiscount: 'Ahorra 2 meses',
      features: [
        'Hasta 50 tarjetas',
        '5 usuarios incluidos',
        'Gestión de equipo',
        'API de integración',
        'Reportes ejecutivos',
        'Branding personalizado',
        'Soporte 24/7 prioritario',
        'Análisis por equipo',
      ],
    },
    {
      id: 'business-pro',
      name: 'Negocios Pro',
      segment: 'SMB',
      price: 300,
      priceLabel: '/mes',
      icon: <Rocket size={28} strokeWidth={1.5} />,
      buttonText: 'Contratar Ahora',
      annualDiscount: 'Ahorra 2 meses',
      features: [
        'Tarjetas ilimitadas',
        '10 usuarios incluidos',
        'Todo lo de Negocios',
        'Automatización avanzada',
        'Integración CRM',
        'Diseños exclusivos',
        'Training incluido',
        'SLA garantizado',
      ],
    },
  ];

  const getSegmentPlans = (segment: 'B2C' | 'SMB' | 'B2B') =>
    plans.filter((p) => p.segment === segment);

  const getAnnualPrice = (monthlyPrice: number) =>
    Math.round(monthlyPrice * 10);

  const renderPlanCard = (plan: Plan, fullWidth = false) => {
    const showAnnual =
      billingCycle === 'annual' && plan.price > 0 && plan.id !== 'enterprise';
    const annualPrice = getAnnualPrice(plan.price);

    return (
      <Col
        key={plan.id}
        xs={12}
        md={fullWidth ? 12 : 6}
        className="mb-4"
      >
        <Card className={`pricing-card h-100${plan.popular ? ' popular-card' : ''}`}>
          {plan.badge && (
            <div className="plan-badge">
              <Badge
                bg={plan.popular ? 'warning' : 'info'}
                className="px-3 py-2 rounded-pill"
              >
                {plan.badge}
              </Badge>
            </div>
          )}

          <Card.Body className="text-center p-4">
            <div className="plan-icon">{plan.icon}</div>

            <Card.Title className="plan-name mb-2">{plan.name}</Card.Title>

            <div className="plan-price my-4">
              {plan.price === 0 && plan.id !== 'enterprise' ? (
                <>
                  <span className="price-amount">Gratis</span>
                  <span className="price-period d-block mt-1">para siempre</span>
                </>
              ) : plan.id === 'enterprise' ? (
                <>
                  <span className="price-custom">Personalizado</span>
                  <span className="price-period d-block mt-1">{plan.priceLabel}</span>
                </>
              ) : showAnnual ? (
                <>
                  <span className="price-currency">$</span>
                  <span className="price-amount">{annualPrice}</span>
                  <span className="price-period d-block mt-1">
                    /año · {plan.annualDiscount}
                  </span>
                  <small className="d-block mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Equivale a ${plan.price}/mes
                  </small>
                </>
              ) : (
                <>
                  <span className="price-currency">$</span>
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.priceLabel}</span>
                </>
              )}
            </div>

            <Button
              variant={plan.popular ? 'primary' : 'outline-primary'}
              className={`w-100 py-2 rounded-pill fw-semibold${plan.popular ? ' btn-popular' : ''}`}
              onClick={() => alert(`Funcionalidad de contratación — ${plan.name}`)}
            >
              {plan.buttonText ?? (plan.price === 0 ? 'Comenzar Gratis' : 'Contratar Ahora')}
            </Button>
          </Card.Body>

          <Card.Footer className="bg-transparent border-0 pt-0 pb-4 px-4">
            <div className="features-list">
              <p className="features-label">Características incluidas</p>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <CheckCircle size={15} className="feature-check" />
                  <span className="text-muted">{feature}</span>
                </div>
              ))}
            </div>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  const renderComparisonTable = () => {
    const rows = [
      { feature: 'Tarjetas digitales',       basic: '3',        premium: 'Ilimitadas',         business: '50+' },
      { feature: 'Plantillas disponibles',   basic: '5',        premium: 'Todas',              business: 'Todas + Exclusivas' },
      { feature: 'Usuarios incluidos',       basic: '1',        premium: '1',                  business: '5' },
      { feature: 'Análisis avanzado',        basic: '✗',        premium: '✓',                  business: '✓' },
      { feature: 'Soporte prioritario',      basic: '✗',        premium: '✓ 24/7',             business: '✓ Dedicado' },
      { feature: 'API de integración',       basic: '✗',        premium: '✗',                  business: '✓' },
      { feature: 'Branding personalizado',   basic: '✗',        premium: 'Básico',             business: 'Completo' },
      { feature: 'Códigos QR personalizados',basic: '✗',        premium: '✓',                  business: '✓' },
    ];

    return (
      <div className="comparison-table">
        <div className="text-center mb-4">
          <h3 className="mb-2">Comparativa de características</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Encuentra el plan que mejor se adapta a tus necesidades
          </p>
        </div>

        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="comparison-card">
              <div className="comparison-header">
                <span>Característica</span>
                <span className="text-center">Básico</span>
                <span className="text-center">Premium</span>
                <span className="text-center">Negocios</span>
              </div>
              {rows.map((row, idx) => (
                <div key={idx} className="comparison-row">
                  <span className="fw-medium">{row.feature}</span>
                  <span className="text-center">{row.basic}</span>
                  <span className="text-center">{row.premium}</span>
                  <span className="text-center">{row.business}</span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const renderEnterpriseSection = () => {
    const benefits = [
      { icon: Shield,     title: 'Seguridad Empresarial',    desc: 'Encriptación avanzada y cumplimiento ISO 27001' },
      { icon: Zap,        title: 'Escalabilidad Automática', desc: 'Infraestructura que crece con tu negocio' },
      { icon: Headphones, title: 'Soporte Dedicado 24/7',    desc: 'Gerente de cuenta exclusivo, respuesta < 1 h' },
      { icon: BarChart,   title: 'Analytics Avanzado',       desc: 'Dashboards personalizados y KPIs a medida' },
      { icon: Clock,      title: '99.9% Uptime',             desc: 'SLA garantizado con compensación por downtime' },
      { icon: FileText,   title: 'Cumplimiento Legal',       desc: 'Contratos personalizados y GDPR compliant' },
    ];

    return (
      <>
        <Row className="mt-5">
          <Col>
            <Card className="enterprise-card text-center">
              <Card.Body className="p-5">
                <Building2 size={48} className="mb-3" style={{ color: 'var(--primary)' }} />
                <h2 className="mb-3">¿Necesitas una solución personalizada?</h2>
                <p
                  className="mb-4 mx-auto"
                  style={{ color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7 }}
                >
                  Ofrecemos planes corporativos adaptados a las necesidades específicas de
                  tu empresa. Contáctanos y diseñaremos una solución a tu medida.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button variant="primary" size="lg" className="rounded-pill px-4">
                    <Mail size={18} className="me-2" />
                    Contactar a Ventas
                  </Button>
                  <Button variant="outline-primary" size="lg" className="rounded-pill px-4">
                    <MessageCircle size={18} className="me-2" />
                    Solicitar Demo
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col xs={12} className="plantilla-card-title mb-4 text-center">
            <h3>Beneficios Corporativos</h3>
          </Col>
          {benefits.map(({ icon: Icon, title, desc }, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <div className="benefit-card text-center h-100">
                <div className="benefit-icon">
                  <Icon size={36} />
                </div>
                <h5 className="plantilla-card-title mb-4 text-center">{title}</h5>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  const renderFAQ = () => {
    const faqs = [
      {
        q: '¿Puedo cambiar de plan en cualquier momento?',
        a: 'Sí, puedes actualizar o cancelar tu plan cuando lo necesites. Los cambios se aplican en tu próximo ciclo de facturación sin costo adicional.',
      },
      {
        q: '¿Ofrecen descuentos por pago anual?',
        a: 'Sí, ofrecemos 2 meses gratis al contratar el plan anual. El ahorro es automático al seleccionar facturación anual.',
      },
      {
        q: '¿Hay período de prueba?',
        a: 'Ofrecemos 14 días de prueba gratuita en todos los planes (excepto el plan Básico que ya es gratuito). No necesitas tarjeta de crédito.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencia bancaria, PayPal y criptomonedas seleccionadas.',
      },
      {
        q: '¿Puedo exportar mis datos?',
        a: 'Todos los planes permiten exportar en PDF, CSV y JSON. Los planes Premium y superiores incluyen exportación masiva.',
      },
      {
        q: '¿Ofrecen soporte técnico?',
        a: 'Todos los planes incluyen soporte por email. Los planes Premium y superiores tienen soporte prioritario 24/7 vía chat y teléfono.',
      },
    ];

    return (
      <div className="faq-section mt-5 pt-4">
        <div className="plantilla-card-title mb-4 text-center">
          <h3 className="mb-2">Preguntas frecuentes</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            ¿Tienes más dudas? Estamos aquí para ayudarte
          </p>
        </div>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row>
              {faqs.map(({ q, a }, idx) => (
                <Col md={6} key={idx} className="mb-4 d-flex">
                  <div className="faq-item w-100">
                    <div className="d-flex align-items-start gap-3">
                      <HelpCircle
                        size={20}
                        className="flex-shrink-0 mt-1"
                        style={{ color: 'var(--primary)' }}
                      />
                      <div>
                        <h6 className="mb-2">{q}</h6>
                        <p
                          className="mb-0"
                          style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                        >
                          {a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="pricing-plans-page">
      <div className="pricing-hero plantilla-card-title text-center">
        <Container>
          <h1>Planes y Precios</h1>
          <p className="pricing-subtitle">
            Elige el plan perfecto para tus necesidades. Todos los planes incluyen
            acceso a nuestras plantillas profesionales y actualizaciones continuas.
          </p>
        </Container>
      </div>

      <Container className="py-5">
        {activeTab !== 'b2b' && (
          <div className="text-center mb-5">
            <div className="billing-toggle-wrapper">
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold ${
                  billingCycle === 'monthly' ? 'btn-primary' : 'btn-link text-secondary'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Mensual
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold ${
                  billingCycle === 'annual' ? 'btn-primary' : 'btn-link text-secondary'
                }`}
                onClick={() => setBillingCycle('annual')}
              >
                Anual
                <Badge bg="success" className="ms-2" style={{ fontSize: '0.7rem' }}>
                  Ahorra 2 meses
                </Badge>
              </button>
            </div>
          </div>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k ?? 'b2c')}
          className="pricing-tabs mb-5 justify-content-center border-0"
        >
          <Tab eventKey="b2c" title={<span><Star size={15} className="me-2" />Personas</span>}>
            <div className="mt-4">
              <Row className="justify-content-center">
                {getSegmentPlans('B2C').map((p) => renderPlanCard(p))}
              </Row>
              {renderComparisonTable()}
            </div>
          </Tab>

          <Tab eventKey="smb" title={<span><Users size={15} className="me-2" />Negocios</span>}>
            <div className="mt-4">
              <Row className="justify-content-center">
                {getSegmentPlans('SMB').map((p) => renderPlanCard(p))}
              </Row>
            </div>
          </Tab>

          <Tab eventKey="b2b" title={<span><Building2 size={15} className="me-2" />Empresas</span>}>
            <div className="mt-4">
              <Row className="justify-content-center mb-5">
                <Col md={8} lg={5}>
                  {getSegmentPlans('B2B').map((p) => renderPlanCard(p, false))}
                </Col>
              </Row>
              {renderEnterpriseSection()}
            </div>
          </Tab>
        </Tabs>

        {renderFAQ()}

        <div className="text-center mt-5 pt-4">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            ¿Necesitas ayuda para elegir?{' '}
            <Button
              variant="link"
              className="p-0 ms-1 fw-semibold"
              style={{ color: 'var(--primary)' }}
            >
              Habla con un asesor
            </Button>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default PricingPlans;