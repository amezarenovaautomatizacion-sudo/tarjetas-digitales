import { useState, useEffect } from 'react';
import { Plantilla, PlantillaDetalle, PreviewResponse } from '../types';
import { api } from '../services/api';

export const usePlantillas = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await api.getPlantillas({ activo: true });
      if (response.error) setError(response.error);
      else if (response.data) setPlantillas(response.data.plantillas);
      setLoading(false);
    };
    fetch();
  }, []);

  return { plantillas, loading, error };
};

export const usePlantillaDetalle = (id: number) => {
  const [plantilla, setPlantilla] = useState<PlantillaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await api.getPlantillaById(id);
      if (response.error) setError(response.error);
      else if (response.data) setPlantilla(response.data.plantilla);
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { plantilla, loading, error };
};

export const usePreview = () => {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async (id: number, datos: Record<string, string>) => {
    setLoading(true);
    const response = await api.getPreview(id, datos);
    if (response.error) setError(response.error);
    else if (response.data) setPreview(response.data);
    setLoading(false);
  };

  return { preview, loading, error, generatePreview };
};