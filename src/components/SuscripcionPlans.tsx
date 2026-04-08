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
  Headphones,
  Sparkles,
  HelpCircle,
  Mail,
  MessageCircle
} from 'lucide-react';
import { suscripcionService } from '../services/suscripcion.service';
import LoadingSpinner from '../components/LoadingSpinner';

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
  max_tarjetas: number;
  duracion_dias: number;
}

const SuscripcionPlans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('b2c');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [suscripcionActiva, setSuscripcionActiva] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSuscripcionActiva();
  }, []);

  const cargarSuscripcionActiva = async () => {
    const response = await suscripcionService.getMiSuscripcion();
    if (response.data) {
      setSuscripcionActiva(response.data);
    }
    setLoading(false);
  };

  const plans: Plan[] = [
    {
      id: 'premium',
      name: 'Premium',
      segment: 'B2C',
      price: 40,
      priceLabel: '/mes',
      icon: <Sparkles size={28} strokeWidth={1.5} />,
      popular: true,
      badge: 'Más Popular',
      buttonText: 'Solicitar por WhatsApp',
      annualDiscount: 'Ahorra 2 meses',
      max_tarjetas: 1,
      duracion_dias: 30,
      features: [
        '1 Tarjeta personalizable',
        'Todas las plantillas',
        'Soporte prioritario 24/7',
        'Personalización completa',
        'Edición de información 24/7',
        'Códigos QR personalizados',
        'Sin publicidad',
      ],
    },
    {
      id: 'business',
      name: 'Negocios',
      segment: 'SMB',
      price: 150,
      priceLabel: '/mes',
      icon: <Users size={28} strokeWidth={1.5} />,
      badge: 'Para Equipos',
      buttonText: 'Solicitar por WhatsApp',
      annualDiscount: 'Ahorra 2 meses',
      max_tarjetas: 10,
      duracion_dias: 30,
      features: [
        '10 Tarjetas personalizables',
        'Todas las plantillas',
        'Branding Personalizado',
        'Soporte prioritario 24/7',
        'Personalización completa',
        'Edición de información 24/7',
        'Códigos QR personalizados',
        'Sin publicidad',
      ],
    },
  ];

  const handleSolicitarPlan = (plan: Plan) => {
    const userData = localStorage.getItem('userData');
    const email = userData ? JSON.parse(userData).email : '';
    const mensaje = `Hola, estoy interesado en el plan ${plan.name}. Mi correo registrado es: ${email}`;
    const whatsappUrl = `https://wa.me/523326239790?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getSegmentPlans = (segment: 'B2C' | 'SMB' | 'B2B') =>
    plans.filter((p) => p.segment === segment);

  const getAnnualPrice = (monthlyPrice: number) =>
    Math.round(monthlyPrice * 10);

  const renderPlanCard = (plan: Plan, fullWidth = false) => {
    const showAnnual = billingCycle === 'annual' && plan.price > 0;
    const annualPrice = getAnnualPrice(plan.price);
    const tieneSuscripcionActiva = suscripcionActiva?.tiene_suscripcion === true;
    const planActivo = suscripcionActiva?.suscripcion?.plan_nombre?.toLowerCase() === plan.name.toLowerCase();

    return (
      <Col
        key={plan.id}
        xs={12}
        md={fullWidth ? 12 : 6}
        className="mb-4"
      >
        <Card className={`pricing-card h-100${plan.popular ? ' popular-card' : ''}${planActivo ? ' plan-activo' : ''}`}>
          {planActivo && (
            <div className="plan-activo-badge">
              <Badge bg="success" className="px-3 py-2 rounded-pill">
                Tu plan actual
              </Badge>
            </div>
          )}
          {plan.badge && !planActivo && (
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
              {showAnnual ? (
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

            <div className="plan-limits mb-3">
              <small className="text-muted">
                📇 {plan.max_tarjetas === 0 ? 'Tarjetas ilimitadas' : `${plan.max_tarjetas} tarjeta${plan.max_tarjetas > 1 ? 's' : ''}`}
              </small>
            </div>

            <Button
              variant={plan.popular ? 'primary' : 'outline-primary'}
              className={`w-100 py-2 rounded-pill fw-semibold${plan.popular ? ' btn-popular' : ''}`}
              onClick={() => handleSolicitarPlan(plan)}
              disabled={planActivo}
            >
              {planActivo ? 'Plan Activo' : (plan.buttonText ?? 'Solicitar por WhatsApp')}
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
      { feature: 'Tarjetas digitales', premium: '1', negocios: '10' },
      { feature: 'Plantillas disponibles', premium: 'Todas', negocios: 'Todas + Exclusivas' },
      { feature: 'QR dinámico', premium: '✓', negocios: '✓' },
      { feature: 'Soporte prioritario', premium: '✓ 24/7', negocios: '✓ Dedicado' },
      { feature: 'Branding personalizado', premium: '✗', negocios: '✓' },
      { feature: 'Analítica avanzada', premium: '✗', negocios: '✓' },
      { feature: 'Sin publicidad', premium: '✓', negocios: '✓' },
    ];

    return (
      <div className="comparison-table mt-5">
        <div className="text-center plantillas-title mb-4">
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
                <span className="text-center">Premium</span>
                <span className="text-center">Negocios</span>
              </div>
              {rows.map((row, idx) => (
                <div key={idx} className="comparison-row">
                  <span className="fw-medium">{row.feature}</span>
                  <span className="text-center">{row.premium}</span>
                  <span className="text-center">{row.negocios}</span>
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
      { icon: Shield, title: 'Seguridad Empresarial', desc: 'Encriptación avanzada y cumplimiento ISO 27001' },
      { icon: Zap, title: 'Escalabilidad Automática', desc: 'Infraestructura que crece con tu negocio' },
      { icon: Headphones, title: 'Soporte Dedicado 24/7', desc: 'Gerente de cuenta exclusivo, respuesta < 1 h' },
      { icon: Clock, title: '99.9% Uptime', desc: 'SLA garantizado con compensación por downtime' },
      { icon: FileText, title: 'Cumplimiento Legal', desc: 'Contratos personalizados y GDPR compliant' },
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
                  <Button variant="primary" size="lg" className="rounded-pill px-4" onClick={() => window.open('https://wa.me/523326239790', '_blank')}>
                    <Mail size={18} className="me-2" />
                    Contactar a Ventas
                  </Button>
                  <Button variant="outline-primary" size="lg" className="rounded-pill px-4" onClick={() => window.open('https://wa.me/523326239790', '_blank')}>
                    <MessageCircle size={18} className="me-2" />
                    Solicitar Demo
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col xs={12} className="text-center mb-4">
            <h3>Beneficios Corporativos</h3>
          </Col>
          {benefits.map(({ icon: Icon, title, desc }, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <div className="benefit-card text-center h-100">
                <div className="benefit-icon">
                  <Icon size={36} />
                </div>
                <h5>{title}</h5>
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
        q: '¿Cómo contrato un plan?',
        a: 'Para contratar un plan, haz clic en "Solicitar por WhatsApp" en el plan deseado. Un asesor se pondrá en contacto contigo para activar tu suscripción.',
      },
      {
        q: '¿Cómo se activa mi suscripción?',
        a: 'Una vez que contactes a nuestro equipo de ventas, ellos te guiarán en el proceso de pago y activarán tu suscripción manualmente desde el panel de administración.',
      },
      {
        q: '¿Puedo cambiar de plan en cualquier momento?',
        a: 'Sí, puedes actualizar tu plan cuando lo necesites. Contáctanos y ajustaremos tu suscripción según tus necesidades.',
      },
      {
        q: '¿Ofrecen descuentos por pago anual?',
        a: 'Sí, ofrecemos 2 meses gratis al contratar el plan anual. El ahorro es automático al seleccionar facturación anual.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos transferencia bancaria, tarjetas de crédito/débito y PayPal. Nuestro equipo de ventas te proporcionará los detalles al contactarnos.',
      },
      {
        q: '¿Ofrecen soporte técnico?',
        a: 'Todos los planes incluyen soporte por email. Los planes Premium y Negocios tienen soporte prioritario 24/7 vía WhatsApp.',
      },
    ];

    return (
      <div className="faq-section mt-5 pt-4">
        <div className="text-center plantillas-title mb-4">
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-3">Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="pricing-plans-page">
      <div className="pricing-hero text-center">
        <Container>
          <h1 className='h1_pricing'>Planes y Precios</h1>
          <p className="pricing-subtitle">
            Elige el plan perfecto para tus necesidades. Todos los planes incluyen
            acceso a nuestras plantillas profesionales y actualizaciones continuas.
          </p>
        </Container>
      </div>

      <Container className="py-5">
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
                  <Card className="enterprise-card text-center">
                    <Card.Body className="p-5">
                      <Building2 size={48} className="mb-3" style={{ color: 'var(--primary)' }} />
                      <h2 className="mb-3">Plan Corporativo</h2>
                      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Solución personalizada para tu empresa
                      </p>
                      <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Button variant="primary" size="lg" className="rounded-pill px-4" onClick={() => window.open('https://wa.me/523326239790', '_blank')}>
                          <Mail size={18} className="me-2" />
                          Contactar a Ventas
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              {renderEnterpriseSection()}
            </div>
          </Tab>
        </Tabs>

        {renderFAQ()}
      </Container>
    </div>
  );
};

export default SuscripcionPlans;