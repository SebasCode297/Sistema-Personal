import { clienteApi } from "../../../api/clienteApi";

export type EstadoMeta = "activa" | "pausada" | "completada" | "abandonada";

export interface Meta {
  id: number;
  titulo: string;
  descripcion: string | null;
  valor_objetivo: string;
  valor_actual: string;
  unidad: string;
  estado: EstadoMeta;
  fecha_inicio: string;
  fecha_fin: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface FormularioMeta {
  titulo: string;
  descripcion?: string;
  valor_objetivo: number;
  valor_actual?: number;
  unidad?: string;
  estado?: EstadoMeta;
  fecha_inicio?: string;
  fecha_fin?: string | null;
}

export interface ResumenMetas {
  activas: string;
  completadas: string;
  pausadas: string;
  total: string;
}

export const metasServicio = {
  async obtenerMetas(estado?: string): Promise<{ ok: boolean; metas: Meta[] }> {
    const query = estado ? `?estado=${estado}` : "";
    return clienteApi(`/api/metas${query}`);
  },

  async crearMeta(datos: FormularioMeta): Promise<{ ok: boolean; meta: Meta }> {
    return clienteApi("/api/metas", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async actualizarMeta(id: number, datos: FormularioMeta): Promise<{ ok: boolean; meta: Meta }> {
    return clienteApi(`/api/metas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },

  async actualizarProgreso(id: number, valor_actual: number): Promise<{ ok: boolean; meta: Meta }> {
    return clienteApi(`/api/metas/${id}/progreso`, {
      method: "PATCH",
      body: JSON.stringify({ valor_actual }),
    });
  },

  async eliminarMeta(id: number): Promise<{ ok: boolean }> {
    return clienteApi(`/api/metas/${id}`, { method: "DELETE" });
  },

  async resumenMetas(): Promise<{ ok: boolean; resumen: ResumenMetas }> {
    return clienteApi("/api/metas/resumen");
  },
};
