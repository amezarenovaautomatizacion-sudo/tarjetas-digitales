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