import { clienteApi } from "../../../api/clienteApi";

export interface Categoria {
  id: number;
  nombre: string;
  tipo: "ingreso" | "gasto" | "ambos";
}

export interface Ingreso {
  id: number;
  monto: string;
  descripcion: string | null;
  fecha: string;
  categoria_id: number | null;
  categoria_nombre: string | null;
  creado_en: string;
}

export interface Gasto {
  id: number;
  monto: string;
  descripcion: string | null;
  fecha: string;
  categoria_id: number | null;
  categoria_nombre: string | null;
  creado_en: string;
}

export interface ResumenFinanciero {
  total_general: string;
  total_mes_actual: string;
}

export interface GastoPorCategoria {
  categoria: string;
  total: string;
  cantidad: number;
}

export interface EvolucionMensual {
  mes: string;
  ingresos: string;
  gastos: string;
}

export interface FormularioMovimiento {
  monto: number;
  descripcion?: string;
  categoria_id?: number | null;
  fecha: string;
}

export const finanzasServicio = {
  // Categorías
  async obtenerCategorias(): Promise<{ ok: boolean; categorias: Categoria[] }> {
    return clienteApi("/api/finanzas/categorias");
  },

  // Ingresos
  async obtenerIngresos(mes?: string): Promise<{ ok: boolean; ingresos: Ingreso[] }> {
    const query = mes ? `?mes=${mes}` : "";
    return clienteApi(`/api/finanzas/ingresos${query}`);
  },

  async crearIngreso(datos: FormularioMovimiento): Promise<{ ok: boolean; ingreso: Ingreso }> {
    return clienteApi("/api/finanzas/ingresos", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async actualizarIngreso(id: number, datos: FormularioMovimiento): Promise<{ ok: boolean; ingreso: Ingreso }> {
    return clienteApi(`/api/finanzas/ingresos/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },

  async eliminarIngreso(id: number): Promise<{ ok: boolean }> {
    return clienteApi(`/api/finanzas/ingresos/${id}`, { method: "DELETE" });
  },

  async resumenIngresos(): Promise<{ ok: boolean; resumen: ResumenFinanciero }> {
    return clienteApi("/api/finanzas/ingresos/resumen");
  },

  // Gastos
  async obtenerGastos(mes?: string): Promise<{ ok: boolean; gastos: Gasto[] }> {
    const query = mes ? `?mes=${mes}` : "";
    return clienteApi(`/api/finanzas/gastos${query}`);
  },

  async crearGasto(datos: FormularioMovimiento): Promise<{ ok: boolean; gasto: Gasto }> {
    return clienteApi("/api/finanzas/gastos", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async actualizarGasto(id: number, datos: FormularioMovimiento): Promise<{ ok: boolean; gasto: Gasto }> {
    return clienteApi(`/api/finanzas/gastos/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },

  async eliminarGasto(id: number): Promise<{ ok: boolean }> {
    return clienteApi(`/api/finanzas/gastos/${id}`, { method: "DELETE" });
  },

  async resumenGastos(): Promise<{ ok: boolean; resumen: ResumenFinanciero }> {
    return clienteApi("/api/finanzas/gastos/resumen");
  },

  async gastosPorCategoria(mes?: string): Promise<{ ok: boolean; datos: GastoPorCategoria[] }> {
    const query = mes ? `?mes=${mes}` : "";
    return clienteApi(`/api/finanzas/gastos/por-categoria${query}`);
  },

  async evolucionMensual(): Promise<{ ok: boolean; datos: EvolucionMensual[] }> {
    return clienteApi("/api/finanzas/evolucion-mensual");
  },
};
