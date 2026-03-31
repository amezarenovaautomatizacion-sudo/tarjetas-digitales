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

export interface PlantillaDetalle extends Plantilla {
  html_content: string;
  css_content: string;
  usa_bootstrap: number;
  usa_bootstrap_icons: number;
  bootstrap_version: string;
  variables_requeridas: Variable[];
}

export interface PreviewResponse {
  html_preview: string;
  css_preview: string;
  usa_bootstrap: boolean;
  usa_bootstrap_icons: boolean;
  bootstrap_version: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
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
  };
  plantilla_detalle?: PlantillaDetalle;
}

