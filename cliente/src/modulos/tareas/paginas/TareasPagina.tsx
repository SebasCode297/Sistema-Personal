import React, { useCallback, useEffect, useState } from "react";
import {
  tareasServicio,
  type EstadoTarea,
  type FormularioTarea as DatosTarea,
  type PrioridadTarea,
  type Tarea,
} from "../servicios/tareasServicio";
import { FormularioTarea } from "../componentes/FormularioTarea";
import "../tareas.css";

const etiquetasEstado: Record<EstadoTarea, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

const etiquetasPrioridad: Record<PrioridadTarea, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const TareasPagina: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | "">("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | "">("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Tarea | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await tareasServicio.obtenerTareas({
        estado: filtroEstado,
        prioridad: filtroPrioridad,
      });
      if (respuesta.ok) setTareas(respuesta.tareas);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, filtroPrioridad]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function handleGuardar(datos: DatosTarea) {
    if (editando) {
      await tareasServicio.actualizarTarea(editando.id, datos);
      setEditando(null);
    } else {
      await tareasServicio.crearTarea(datos);
    }
    await cargarDatos();
  }

  async function handleEliminar(id: number) {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await tareasServicio.eliminarTarea(id);
    if (editando?.id === id) setEditando(null);
    await cargarDatos();
  }

  async function marcarCompletada(tarea: Tarea) {
    await tareasServicio.actualizarTarea(tarea.id, {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || undefined,
      prioridad: tarea.prioridad,
      fecha_limite: tarea.fecha_limite ? tarea.fecha_limite.split("T")[0] : null,
      estado: "completada",
    });
    await cargarDatos();
  }

  function formatearFecha(fecha: string | null) {
    if (!fecha) return "Sin fecha";
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const pendientes = tareas.filter((t) => t.estado === "pendiente").length;
  const enProgreso = tareas.filter((t) => t.estado === "en_progreso").length;
  const completadas = tareas.filter((t) => t.estado === "completada").length;

  return (
    <div>
      <header className="tareas-header">
        <div>
          <span className="tareas-insignia">Módulo Independiente — Fase 5</span>
          <h1 className="tareas-titulo">Tareas</h1>
          <p className="tareas-subtitulo">
            CRUD propio. No se relaciona con Finanzas, Metas ni Calendario.
          </p>
        </div>
      </header>

      <div className="tareas-resumen-grid">
        <div className="tareas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Pendientes</span>
          <span className="tarjeta-resumen-monto">{pendientes}</span>
        </div>
        <div className="tareas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">En progreso</span>
          <span className="tarjeta-resumen-monto">{enProgreso}</span>
        </div>
        <div className="tareas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Completadas</span>
          <span className="tarjeta-resumen-monto">{completadas}</span>
        </div>
      </div>

      <div className="tareas-cuerpo">
        <div className="tareas-lista-panel">
          <div className="tareas-filtros">
            <select
              className="campo-input"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoTarea | "")}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
            <select
              className="campo-input"
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadTarea | "")}
              aria-label="Filtrar por prioridad"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div className="tareas-tabla-contenedor">
            {cargando ? (
              <div className="tareas-empty">Cargando tareas...</div>
            ) : tareas.length === 0 ? (
              <div className="tareas-empty">No hay tareas con estos filtros.</div>
            ) : (
              <table className="tareas-tabla">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha límite</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.map((tarea) => (
                    <tr key={tarea.id}>
                      <td>
                        <strong>{tarea.titulo}</strong>
                        {tarea.descripcion ? (
                          <p className="tareas-descripcion">{tarea.descripcion}</p>
                        ) : null}
                      </td>
                      <td>
                        <span className={`badge-prioridad ${tarea.prioridad}`}>
                          {etiquetasPrioridad[tarea.prioridad]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-estado ${tarea.estado}`}>
                          {etiquetasEstado[tarea.estado]}
                        </span>
                      </td>
                      <td>{formatearFecha(tarea.fecha_limite)}</td>
                      <td>
                        <div className="celda-acciones">
                          {tarea.estado !== "completada" ? (
                            <button
                              type="button"
                              className="btn-secundario btn-accion-tabla"
                              onClick={() => marcarCompletada(tarea)}
                            >
                              Completar
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="btn-secundario btn-accion-tabla"
                            onClick={() => setEditando(tarea)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-peligro btn-accion-tabla"
                            onClick={() => handleEliminar(tarea.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="tareas-panel-accion">
          <h2 className="tareas-panel-titulo">{editando ? "Editar tarea" : "Nueva tarea"}</h2>
          <FormularioTarea
            onGuardar={handleGuardar}
            editando={editando}
            onCancelarEdicion={() => setEditando(null)}
          />
        </div>
      </div>
    </div>
  );
};
