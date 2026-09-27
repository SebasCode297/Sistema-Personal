import { clienteApi } from "../../../api/clienteApi";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  creado_en?: string;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export interface RespuestaAuth {
  ok: boolean;
  mensaje: string;
  usuario: Usuario;
  token: string;
}

export interface RespuestaPerfil {
  ok: boolean;
  usuario: Usuario;
}

const CLAVE_TOKEN = "mipanel_token";

export const authServicio = {
  /**
   * Registra un nuevo usuario
   */
  async registro(datos: DatosRegistro): Promise<RespuestaAuth> {
    return clienteApi<RespuestaAuth>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  /**
   * Inicia sesión con email y contraseña
   */
  async login(credenciales: CredencialesLogin): Promise<RespuestaAuth> {
    return clienteApi<RespuestaAuth>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credenciales),
    });
  },

  /**
   * Obtiene los datos del usuario actual a partir del token guardado
   */
  async obtenerPerfil(): Promise<RespuestaPerfil> {
    return clienteApi<RespuestaPerfil>("/api/auth/me", {
      method: "GET",
    });
  },

  /**
   * Utilidades de almacenamiento local del token
   */
  guardarToken(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
  },

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  },

  eliminarToken(): void {
    localStorage.removeItem(CLAVE_TOKEN);
  },
};
