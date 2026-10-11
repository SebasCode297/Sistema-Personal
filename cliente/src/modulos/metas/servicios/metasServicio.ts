import { clienteApi } from "../../../api/clienteApi";

export interface Meta {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_fin: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface FormularioMeta {
  titulo: string;
  descripcion?: string;
  fecha_fin?: string | null;
}

export interface ResumenMetas {
  total: string;
}

export const metasServicio = {
  async obtenerMetas(): Promise<{ ok: boolean; metas: Meta[] }> {
    return clienteApi("/api/metas");
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

  async eliminarMeta(id: number): Promise<{ ok: boolean }> {
    return clienteApi(`/api/metas/${id}`, { method: "DELETE" });
  },

  async resumenMetas(): Promise<{ ok: boolean; resumen: ResumenMetas }> {
    return clienteApi("/api/metas/resumen");
  },
};
