import React, { useCallback, useEffect, useState } from "react";
import {
  tareasServicio,
  type FormularioTarea as DatosTarea,
  type Tarea,
} from "../servicios/tareasServicio";
import { FormularioTarea } from "../componentes/FormularioTarea";
import "../tareas.css";

export const TareasPagina: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Tarea | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaDetalle, setTareaDetalle] = useState<Tarea | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await tareasServicio.obtenerTareas({});
      if (respuesta.ok) setTareas(respuesta.tareas);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

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

  async function handleEliminar(id: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await tareasServicio.eliminarTarea(id);
    if (editando?.id === id) setEditando(null);
    if (tareaDetalle?.id === id) setTareaDetalle(null);
    await cargarDatos();
  }

  async function marcarCompletada(tarea: Tarea, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    await tareasServicio.actualizarTarea(tarea.id, {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || undefined,
      fecha_inicio: tarea.fecha_inicio ? tarea.fecha_inicio.split("T")[0] : null,
      fecha_fin: tarea.fecha_fin ? tarea.fecha_fin.split("T")[0] : null,
      fecha_limite: tarea.fecha_fin ? tarea.fecha_fin.split("T")[0] : null,
      estado: "completada",
      monto: tarea.monto !== null && tarea.monto !== undefined ? parseFloat(String(tarea.monto)) : null,
    });
    if (tareaDetalle?.id === tarea.id) {
      setTareaDetalle({ ...tareaDetalle, estado: "completada" });
    }
    await cargarDatos();
  }

  function formatearFecha(fecha: string | null | undefined) {
    if (!fecha) return "Sin fecha";
    const soloFecha = fecha.split("T")[0];
    const partes = soloFecha.split("-");
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      const d = new Date(anio, mes, dia);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    const d = new Date(fecha);
    return isNaN(d.getTime())
      ? "Sin fecha"
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  const completadas = tareas.filter((t) => t.estado === "completada").length;
  const activas = tareas.filter((t) => t.estado !== "completada").length;

  return (
    <div className="tareas-pagina">
      <header className="tareas-header">
        <div>
          <h1 className="tareas-titulo">Gestión de Tareas</h1>
          <p className="tareas-subtitulo">Organiza tus actividades pendientes y fechas límite</p>
        </div>
        <button
          type="button"
          className="btn-crear-accion"
          onClick={() => {
            setEditando(null);
            setModalAbierto(true);
          }}
        >
          + Nueva Tarea
        </button>
      </header>

      <div className="tareas-resumen-grid">
        <div className="tareas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Activas</span>
          <span className="tarjeta-resumen-monto">{activas}</span>
        </div>
        <div className="tareas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Completadas</span>
          <span className="tarjeta-resumen-monto" style={{ color: "var(--color-exito)" }}>
            {completadas}
          </span>
        </div>
      </div>

      <div className="tareas-cuerpo">
        <div className="tareas-lista-panel">
          {cargando ? (
            <div className="tareas-empty">Cargando tareas...</div>
          ) : tareas.length === 0 ? (
            <div className="tareas-empty">No hay tareas aún. ¡Crea una nueva tarea!</div>
          ) : (
            <div className="tareas-grid">
              {tareas.map((tarea) => {
                const esCompletada = tarea.estado === "completada";
                const tieneMonto = tarea.monto !== null && tarea.monto !== undefined && Number(tarea.monto) > 0;
                const fechaFinVal = tarea.fecha_fin || tarea.fecha_limite;

                return (
                  <article
                    key={tarea.id}
                    className={`tarea-tarjeta ${esCompletada ? "completada" : ""}`}
                    onClick={() => setTareaDetalle(tarea)}
                    title="Clic para ver resumen"
                  >
                    {/* Cabecera idéntica a Metas */}
                    <div className="tarea-tarjeta-header">
                      <span className="tarea-tarjeta-titulo">{tarea.titulo}</span>
                      <span className={`tarea-badge-estado ${esCompletada ? "completada" : "pendiente"}`}>
                        {esCompletada ? "Completada" : "Pendiente"}
                      </span>
                    </div>

                    {/* Descripción */}
                    {tarea.descripcion && (
                      <p className="tarea-tarjeta-descripcion">{tarea.descripcion}</p>
                    )}

                    {/* Información inferior (Fechas y Valor) */}
                    <div className="tarea-tarjeta-info-cuerpo">
                      {tieneMonto && (
                        <div className="tarea-info-linea">
                          <span>Valor:</span>
                          <span className="tarea-precio-valor">${Number(tarea.monto).toFixed(2)}</span>
                        </div>
                      )}

                      <div className="tarea-info-linea">
                        <span>Plazo:</span>
                        <span>
                          {tarea.fecha_inicio ? formatearFecha(tarea.fecha_inicio) : "Inmediata"}
                          {" — "}
                          {fechaFinVal ? formatearFecha(fechaFinVal) : "Sin definir"}
                        </span>
                      </div>

                      {/* Footer y Acciones limpias */}
                      <div className="tarea-tarjeta-footer">
                        <span className="tarea-btn-resumen">Ver resumen</span>

                        <div className="tarea-acciones-grupo">
                          {!esCompletada && (
                            <>
                              <button
                                type="button"
                                className="btn-completar-accion"
                                onClick={(e) => marcarCompletada(tarea, e)}
                              >
                                Completar
                              </button>
                              <button
                                type="button"
                                className="btn-secundario btn-accion-tabla"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditando(tarea);
                                  setModalAbierto(true);
                                }}
                              >
                                Editar
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="btn-peligro btn-accion-tabla"
                            onClick={(e) => handleEliminar(tarea.id, e)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Resumen / Detalle al dar clic en la tarjeta */}
      {tareaDetalle && (
        <div className="modal-overlay" onClick={() => setTareaDetalle(null)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resumen de la Tarea</h2>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setTareaDetalle(null)}
              >
                ✕
              </button>
            </div>

            <div className="tarea-resumen-detalle">
              <div className="tarea-detalle-item">
                <span className="tarea-detalle-label">Título</span>
                <span className="tarea-detalle-valor" style={{ fontSize: "1.15rem", color: "var(--color-primario)" }}>
                  {tareaDetalle.titulo}
                </span>
              </div>

              <div className="tarea-detalle-item">
                <span className="tarea-detalle-label">Estado</span>
                <div>
                  <span className={`tarea-badge-estado ${tareaDetalle.estado === "completada" ? "completada" : "pendiente"}`}>
                    {tareaDetalle.estado === "completada" ? "Completada" : "Pendiente"}
                  </span>
                </div>
              </div>

              {tareaDetalle.monto !== null && tareaDetalle.monto !== undefined && Number(tareaDetalle.monto) > 0 && (
                <div className="tarea-detalle-item">
                  <span className="tarea-detalle-label">Valor a pagar</span>
                  <span className="tarea-detalle-valor" style={{ color: "#047857" }}>
                    ${Number(tareaDetalle.monto).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="tarea-fechas-grid-modal">
                <div className="tarea-detalle-item">
                  <span className="tarea-detalle-label">Fecha de inicio</span>
                  <span className="tarea-detalle-valor">
                    {tareaDetalle.fecha_inicio ? formatearFecha(tareaDetalle.fecha_inicio) : "Inmediata"}
                  </span>
                </div>

                <div className="tarea-detalle-item">
                  <span className="tarea-detalle-label">Fecha de fin</span>
                  <span className="tarea-detalle-valor">
                    {formatearFecha(tareaDetalle.fecha_fin || tareaDetalle.fecha_limite)}
                  </span>
                </div>
              </div>

              {tareaDetalle.descripcion && (
                <div className="tarea-detalle-item">
                  <span className="tarea-detalle-label">Descripción</span>
                  <p className="tarea-detalle-desc">{tareaDetalle.descripcion}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                {tareaDetalle.estado !== "completada" && (
                  <button
                    type="button"
                    className="btn-completar-accion"
                    style={{ flex: 1, padding: "0.55rem 1rem", fontSize: "0.88rem" }}
                    onClick={() => marcarCompletada(tareaDetalle)}
                  >
                    Completar Tarea
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secundario"
                  style={{ flex: 1 }}
                  onClick={() => setTareaDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Tarea */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => { setModalAbierto(false); setEditando(null); }}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? "Editar Tarea" : "Nueva Tarea"}</h2>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => { setModalAbierto(false); setEditando(null); }}
              >
                ✕
              </button>
            </div>
            <FormularioTarea
              onGuardar={async (datos) => {
                await handleGuardar(datos);
                setModalAbierto(false);
                setEditando(null);
              }}
              editando={editando}
              onCancelarEdicion={() => {
                setModalAbierto(false);
                setEditando(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
