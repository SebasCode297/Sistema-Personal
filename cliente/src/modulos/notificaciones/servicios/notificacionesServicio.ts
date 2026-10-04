import { clienteApi } from "../../../api/clienteApi";

export type TipoNotificacion = "info" | "alerta" | "recordatorio" | "sistema";

export interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  enlace: string | null;
  creado_en: string;
}

export interface ResumenNotificacionesDatos {
  total: number;
  no_leidas: number;
}

export interface FormularioNotificacionDatos {
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  enlace?: string;
}

interface RespuestaApi<T> {
  ok: boolean;
  datos?: T;
  mensaje?: string;
}

export const notificacionesServicio = {
  async obtenerNotificaciones(soloNoLeidas: boolean = false): Promise<Notificacion[]> {
    const query = soloNoLeidas ? "?soloNoLeidas=true" : "";
    const res = await clienteApi<RespuestaApi<Notificacion[]>>(`/api/notificaciones${query}`);
    return res.datos || [];
  },

  async obtenerResumen(): Promise<ResumenNotificacionesDatos> {
    const res = await clienteApi<RespuestaApi<ResumenNotificacionesDatos>>("/api/notificaciones/resumen");
    return res.datos || { total: 0, no_leidas: 0 };
  },

  async crearNotificacion(datos: FormularioNotificacionDatos): Promise<Notificacion> {
    const res = await clienteApi<RespuestaApi<Notificacion>>("/api/notificaciones", {
      method: "POST",
      body: JSON.stringify(datos),
    });
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al crear notificación");
    }
    return res.datos;
  },

  async marcarComoLeida(id: number): Promise<Notificacion> {
    const res = await clienteApi<RespuestaApi<Notificacion>>(`/api/notificaciones/${id}/leida`, {
      method: "PUT",
    });
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al marcar como leída");
    }
    return res.datos;
  },

  async marcarTodasComoLeidas(): Promise<void> {
    await clienteApi("/api/notificaciones/marcar-todas", {
      method: "PUT",
    });
  },

  async eliminarNotificacion(id: number): Promise<void> {
    await clienteApi(`/api/notificaciones/${id}`, {
      method: "DELETE",
    });
  },

  async limpiarLeidas(): Promise<void> {
    await clienteApi("/api/notificaciones/limpiar-leidas", {
      method: "DELETE",
    });
  },
};
