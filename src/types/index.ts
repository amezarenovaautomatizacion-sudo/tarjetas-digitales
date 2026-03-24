export interface UsuarioData {
  usuarioid: number;
  nombre: string;
  email: string;
  activo: boolean;
  creado: string;
  ultimo_login: string;
  ip_ultimo_login: string;
  rolid: number;
  tipo: string;
  telefono?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string;
  calle: string;
  numero_exterior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  rfc: string;
  razon_social: string;
}

export interface UpdateUserData {
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioData;
  message?: string;
}

export interface Plantilla {
  id: number;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
  descripcion?: string;
  precio?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
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

export interface RespuestaPublica {
  tarjetaclienteid: number;    // Antes te faltaba esto
  nombre_tarjeta: string;      // Y esto
  plantilla_nombre: string;
  slug: string;
  visitas: number;
  renderizado: {
    html: string;
    css: string;
    usa_bootstrap: boolean;
    usa_bootstrap_icons: boolean;
    bootstrap_version: string;
  };
}

export interface RegisterAdminData {
  nombre: string;
  email: string;
  password: string;
  ip_registro: string; // La IP es obligatoria según tu documentación
}