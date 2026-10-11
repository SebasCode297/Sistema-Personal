import { clienteApi } from "../../../api/clienteApi";

export type EstadoTarea = "pendiente" | "completada";

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  fecha_limite?: string | null;
  estado: EstadoTarea;
  monto: number | null;
  creado_en: string;
  actualizado_en: string;
}

export interface FormularioTarea {
  titulo: string;
  descripcion?: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  fecha_limite?: string | null;
  estado?: EstadoTarea;
  monto?: number | null;
}

export interface ResumenTareas {
  pendientes: string;
  completadas: string;
}

export const tareasServicio = {
  async obtenerTareas(filtros?: { estado?: EstadoTarea | "" }): Promise<{ ok: boolean; tareas: Tarea[] }> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.set("estado", filtros.estado);
    const query = params.toString() ? `?${params.toString()}` : "";
    return clienteApi(`/api/tareas${query}`);
  },

  async crearTarea(datos: FormularioTarea): Promise<{ ok: boolean; tarea: Tarea }> {
    return clienteApi("/api/tareas", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async actualizarTarea(id: number, datos: FormularioTarea): Promise<{ ok: boolean; tarea: Tarea }> {
    return clienteApi(`/api/tareas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },

  async eliminarTarea(id: number): Promise<{ ok: boolean }> {
    return clienteApi(`/api/tareas/${id}`, { method: "DELETE" });
  },

  async resumen(): Promise<{ ok: boolean; resumen: ResumenTareas }> {
    return clienteApi("/api/tareas/resumen");
  },
};
