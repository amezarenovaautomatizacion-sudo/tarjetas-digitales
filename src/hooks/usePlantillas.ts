import { useState, useEffect, useCallback } from 'react';
import { Plantilla, PlantillaDetalle, PreviewResponse } from '../types';
import { api } from '../services/api';

export const usePlantillas = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlantillas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await api.getPlantillas({ activo: true });
    if (response.error) setError(response.error);
    else if (response.data) setPlantillas(response.data.plantillas);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlantillas();
  }, [fetchPlantillas]);

  return { plantillas, loading, error, refetch: fetchPlantillas };
};

export const usePlantillaDetalle = (id: number) => {
  const [plantilla, setPlantilla] = useState<PlantillaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlantillaDetalle = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    const response = await api.getPlantillaById(id);
    if (response.error) setError(response.error);
    else if (response.data) setPlantilla(response.data.plantilla);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPlantillaDetalle();
  }, [fetchPlantillaDetalle]);

  return { plantilla, loading, error, refetch: fetchPlantillaDetalle };
};

export const usePreview = () => {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async (id: number, datos: Record<string, string>) => {
    setLoading(true);
    setError(null);
    const response = await api.getPreview(id, datos);
    if (response.error) setError(response.error);
    else if (response.data) setPreview(response.data);
    setLoading(false);
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return { preview, loading, error, generatePreview, clearPreview };
};