import React, { useState, useEffect, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import {
  notificacionesServicio,
  type Notificacion,
} from "../servicios/notificacionesServicio";
import "../notificaciones.css";

export const NotificacionesPagina: React.FC = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [, startTransition] = useTransition();

  async function cargarNotificaciones() {
    try {
      setCargando(true);
      setError(null);
      const datos = await notificacionesServicio.obtenerNotificaciones(soloNoLeidas);
      setNotificaciones(datos);
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al cargar notificaciones";
      setError(msj);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarNotificaciones();
  }, [soloNoLeidas]);

  async function handleMarcarLeida(id: number) {
    try {
      await notificacionesServicio.marcarComoLeida(id);
      startTransition(() => {
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
      });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al actualizar notificación";
      alert(msj);
    }
  }

  async function handleMarcarTodasLeidas() {
    try {
      await notificacionesServicio.marcarTodasComoLeidas();
      startTransition(() => {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al actualizar";
      alert(msj);
    }
  }

  async function handleLimpiarLeidas() {
    const confirmar = window.confirm("¿Deseas eliminar todas las notificaciones ya leídas?");
    if (!confirmar) return;
    try {
      await notificacionesServicio.limpiarLeidas();
      startTransition(() => {
        setNotificaciones((prev) => prev.filter((n) => !n.leida));
      });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al limpiar";
      alert(msj);
    }
  }

  async function handleEliminar(id: number) {
    try {
      await notificacionesServicio.eliminarNotificacion(id);
      startTransition(() => {
        setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al eliminar";
      alert(msj);
    }
  }

  function formatearFecha(fechaIso: string): string {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return fechaIso;
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="notificaciones-pagina">
      <header className="notificaciones-header">
        <div className="notificaciones-titulo-area">
          <h1>Centro de Alertas</h1>
          <p>Avisos automáticos vinculados a tus metas personales</p>
        </div>

        <div className="notificaciones-acciones-top">
          {noLeidasCount > 0 && (
            <button
              type="button"
              className="btn-accion-top"
              onClick={handleMarcarTodasLeidas}
            >
              Marcar todas leídas
            </button>
          )}
          <button
            type="button"
            className="btn-accion-top"
            onClick={handleLimpiarLeidas}
          >
            Limpiar leídas
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="notificaciones-filtros">
        <div className="notificaciones-pills">
          <button
            type="button"
            className={`btn-filtro-pill ${!soloNoLeidas ? "activo" : ""}`}
            onClick={() => setSoloNoLeidas(false)}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            type="button"
            className={`btn-filtro-pill ${soloNoLeidas ? "activo" : ""}`}
            onClick={() => setSoloNoLeidas(true)}
          >
            No leídas ({noLeidasCount})
          </button>
        </div>

        <span className="notificaciones-stats-txt">
          {noLeidasCount} pendiente{noLeidasCount !== 1 ? "s" : ""} de atención
        </span>
      </section>

      {/* Lista */}
      <main className="notificaciones-lista">
        {cargando ? (
          <div className="notificaciones-vacio">
            <p>Cargando avisos...</p>
          </div>
        ) : error ? (
          <div className="notificaciones-vacio">
            <p>{error}</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="notificaciones-vacio">
            <p>
              {soloNoLeidas
                ? "No tienes notificaciones sin leer."
                : "Sin notificaciones. Cuando una meta esté a 7 días de vencer, aparecerá aquí."}
            </p>
          </div>
        ) : (
          notificaciones.map((n) => (
            <article
              key={n.id}
              className={`notificacion-item ${!n.leida ? "no-leida" : ""} tipo-${n.tipo}`}
            >
              <div className="notificacion-cuerpo">
                <div className="notificacion-cabecera">
                  <span className={`badge-tipo ${n.tipo}`}>
                    {n.tipo === "recordatorio" ? "Recordatorio" : n.tipo}
                  </span>
                  <h2 className="notificacion-titulo">{n.titulo}</h2>
                </div>

                <p className="notificacion-mensaje">{n.mensaje}</p>

                <div className="notificacion-meta">
                  <span>{formatearFecha(n.creado_en)}</span>
                  {n.enlace && (
                    <span
                      className="notificacion-enlace"
                      onClick={() => navigate(n.enlace!)}
                    >
                      Ir a Metas →
                    </span>
                  )}
                  {!n.leida && <span className="badge-nuevo-pill">Nuevo</span>}
                </div>
              </div>

              <div className="notificacion-acciones">
                {!n.leida && (
                  <button
                    type="button"
                    className="btn-accion-noti"
                    onClick={() => handleMarcarLeida(n.id)}
                  >
                    Marcar leída
                  </button>
                )}
                <button
                  type="button"
                  className="btn-accion-noti btn-eliminar-noti"
                  onClick={() => handleEliminar(n.id)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
};
