// src/hooks/useTarjetas.ts
import { useState, useEffect, useCallback } from 'react';
import { TarjetaCliente, TarjetaDetalle } from '../types';
import { tarjetaService } from '../services/tarjeta.service';

export const useTarjetas = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTarjetas = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    const response = await tarjetaService.listar(params);
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setTarjetas(response.data.tarjetas || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  const crearTarjeta = useCallback(async (data: any) => {
    const response = await tarjetaService.crear(data);
    if (!response.error) await fetchTarjetas();
    return response;
  }, [fetchTarjetas]);

  const actualizarTarjeta = useCallback(async (id: number, data: any) => {
    const response = await tarjetaService.actualizar(id, data);
    if (!response.error) await fetchTarjetas();
    return response;
  }, [fetchTarjetas]);

  const eliminarTarjeta = useCallback(async (id: number) => {
    const response = await tarjetaService.eliminar(id);
    if (!response.error) await fetchTarjetas();
    return response;
  }, [fetchTarjetas]);

  return { tarjetas, loading, error, fetchTarjetas, crearTarjeta, actualizarTarjeta, eliminarTarjeta };
};

export const useTarjetaDetalle = (id?: number, slug?: string) => {
  const [tarjeta, setTarjeta] = useState<TarjetaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id && !slug) return;
      setLoading(true);
      const response = id ? await tarjetaService.obtener(id) : slug ? await tarjetaService.obtenerPublica(slug) : null;
      if (response?.error) setError(response.error);
      else if (response?.data) setTarjeta(response.data);
      setLoading(false);
    };
    fetch();
  }, [id, slug]);

  return { tarjeta, loading, error };
};