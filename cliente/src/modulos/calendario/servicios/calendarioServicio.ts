import { clienteApi } from "../../../api/clienteApi";

export interface Evento {
  id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  todo_el_dia: boolean;
  categoria: string;
  ubicacion: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface FormularioEventoDatos {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  todo_el_dia: boolean;
  categoria: string;
  ubicacion?: string;
}

interface RespuestaApi<T> {
  ok: boolean;
  datos?: T;
  mensaje?: string;
}

export const calendarioServicio = {
  async obtenerEventos(desde?: string, hasta?: string): Promise<Evento[]> {
    let url = "/api/calendario";
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await clienteApi<RespuestaApi<Evento[]>>(url);
    return res.datos || [];
  },

  async obtenerProximosEventos(): Promise<Evento[]> {
    const res = await clienteApi<RespuestaApi<Evento[]>>("/api/calendario/proximos");
    return res.datos || [];
  },

  async crearEvento(datos: FormularioEventoDatos): Promise<Evento> {
    const res = await clienteApi<RespuestaApi<Evento>>("/api/calendario", {
      method: "POST",
      body: JSON.stringify(datos),
    });
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al registrar evento");
    }
    return res.datos;
  },

  async actualizarEvento(id: number, datos: FormularioEventoDatos): Promise<Evento> {
    const res = await clienteApi<RespuestaApi<Evento>>(`/api/calendario/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
    if (!res.datos) {
      throw new Error(res.mensaje || "Error al actualizar evento");
    }
    return res.datos;
  },

  async eliminarEvento(id: number): Promise<void> {
    await clienteApi(`/api/calendario/${id}`, {
      method: "DELETE",
    });
  },
};
