import { clienteApi } from "../../../api/clienteApi";

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  email: string;
  creado_en: string;
}

export interface ActualizarPerfilDatos {
  nombre: string;
  email: string;
}

export interface CambiarPasswordDatos {
  password_actual: string;
  password_nueva: string;
}

interface RespuestaApi<T> {
  ok: boolean;
  datos?: T;
  mensaje?: string;
}

export const perfilServicio = {
  async obtenerPerfil(): Promise<UsuarioPerfil> {
    const res = await clienteApi<RespuestaApi<UsuarioPerfil>>("/api/perfil");
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al obtener perfil");
    }
    return res.datos;
  },

  async actualizarPerfil(datos: ActualizarPerfilDatos): Promise<UsuarioPerfil> {
    const res = await clienteApi<RespuestaApi<UsuarioPerfil>>("/api/perfil", {
      method: "PUT",
      body: JSON.stringify(datos),
    });
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al actualizar perfil");
    }
    return res.datos;
  },

  async cambiarPassword(datos: CambiarPasswordDatos): Promise<string> {
    const res = await clienteApi<RespuestaApi<void>>("/api/perfil/cambiar-password", {
      method: "PUT",
      body: JSON.stringify(datos),
    });
    return res.mensaje || "Contraseña actualizada exitosamente";
  },

  async eliminarCuenta(password: string): Promise<void> {
    await clienteApi("/api/perfil/eliminar-cuenta", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },
};
