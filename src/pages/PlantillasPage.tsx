// src/pages/PlantillasPage.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Pagination } from 'react-bootstrap';
import { Search, Filter, Grid3x3, List, TrendingUp, Clock, Star } from 'lucide-react';
import { usePlantillas } from '../hooks/usePlantillas';
import LoadingSpinner from '../components/LoadingSpinner';

interface PlantillasPageProps {
  onPlantillaClick: (id: number) => void;
}

const PlantillasPage: React.FC<PlantillasPageProps> = ({ onPlantillaClick }) => {
  const { plantillas, loading, error } = usePlantillas();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  const filteredPlantillas = plantillas
    .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || false))
    .sort((a, b) => {
      if (sortBy === 'popular') return b.visitas - a.visitas;
      if (sortBy === 'recent') return new Date(b.creado).getTime() - new Date(a.creado).getTime();
      return a.nombre.localeCompare(b.nombre);
    });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-container"><h2>Error</h2><p>{error}</p></div>;

  return (
    <div className="plantillas-page">
      <div className="plantillas-header">
        <Container>
          <h1 className="plantillas-title">Explora Nuestras Plantillas</h1>
          <p className="plantillas-subtitle">
            Descubre diseños profesionales para tus tarjetas digitales.
            Personaliza cada detalle y crea una experiencia única.
          </p>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="mb-4">
          <Col md={6} lg={5}>
            <InputGroup>
              <InputGroup.Text className="bg-dark border-secondary">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark border-secondary text-white"
              />
            </InputGroup>
          </Col>
          <Col md={6} lg={7} className="d-flex justify-content-end gap-2 mt-3 mt-md-0">
            <div className="sort-buttons">
              <button 
                className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                <TrendingUp size={16} /> Populares
              </button>
              <button 
                className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                <Clock size={16} /> Recientes
              </button>
              <button 
                className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => setSortBy('name')}
              >
                <Star size={16} /> Nombre
              </button>
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 size={18} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </Col>
        </Row>

        {filteredPlantillas.length === 0 ? (
          <div className="empty-state text-center py-5">
            <p>No se encontraron plantillas</p>
          </div>
        ) : viewMode === 'grid' ? (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredPlantillas.map(plantilla => (
              <Col key={plantilla.plantillaid}>
                <Card className="plantilla-card h-100" onClick={() => onPlantillaClick(plantilla.plantillaid)}>
                  <div className="plantilla-card-image">
                    <div className="image-placeholder">
                      <span>🎴</span>
                    </div>
                    <Badge className="visit-badge" bg="primary">
                      👁️ {plantilla.visitas} visitas
                    </Badge>
                  </div>
                  <Card.Body>
                    <Card.Title className="plantilla-card-title">
                      {plantilla.nombre}
                    </Card.Title>
                    <Card.Text className="plantilla-card-description">
                      {plantilla.descripcion || 'Sin descripción disponible'}
                    </Card.Text>
                    <div className="plantilla-meta">
                      <span className="meta-item">
                        📊 {plantilla.total_variables} variables
                      </span>
                      <span className="meta-item">
                        📅 {new Date(plantilla.creado).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-top-0">
                    <button className="btn-preview-sm">
                      Ver Detalles →
                    </button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="list-view">
            {filteredPlantillas.map(plantilla => (
              <Card key={plantilla.plantillaid} className="plantilla-list-card mb-3" onClick={() => onPlantillaClick(plantilla.plantillaid)}>
                <Row className="g-0 align-items-center">
                  <Col xs={3} md={2}>
                    <div className="list-image-placeholder">
                      🎴
                    </div>
                  </Col>
                  <Col xs={9} md={10}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Card.Title>{plantilla.nombre}</Card.Title>
                          <Card.Text className="text-muted small">
                            {plantilla.descripcion?.substring(0, 100) || 'Sin descripción'}
                          </Card.Text>
                        </div>
                        <div className="list-stats">
                          <span className="stat">👁️ {plantilla.visitas}</span>
                          <span className="stat">📊 {plantilla.total_variables}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default PlantillasPage;