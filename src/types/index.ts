export interface Variable {
  variableid: number;
  nombre: string;
  etiqueta: string;
  descripcion: string | null;
  tipo_dato: string;
  ejemplo: string | null;
  es_requerida: number;
  orden: number;
  opciones?: string | null;
  valor_por_defecto?: string | null;
  validacion?: string | null;
}

export interface Plantilla {
  plantillaid: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  preview_image: string | null;
  categoria_nombre: string | null;
  total_variables: number;
  visitas: number;
  descargas: number;
  creado: string;
  activo?: number;
}

export interface DatosTarjeta {
  nombre: string;
  apellido: string;
  puesto: string;
  empresa: string;
  email: string;
  telefono: string;
  telefono_movil?: string;
  sitio_web?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  lema?: string;
}

export interface TarjetaCliente {
  tarjetaclienteid: number;
  plantillaid: number;
  plantilla_nombre: string;
  nombre_tarjeta: string;
  slug: string;
  visibilidad: 'publico' | 'privado';
  visitas: number;
  creado: string;
  datos?: Record<string, any>;
}

export interface TarjetaDetalle extends TarjetaCliente {
  renderizado?: {
    html: string;
    css: string;
    usa_bootstrap: boolean;
    usa_bootstrap_icons: boolean;
    bootstrap_version: string;
  };
}

export interface RegisterAdminDatas {
  nombre: string;
  email: string;
  password: string;
  ip_registro: string; // La IP es obligatoria según tu documentación
}