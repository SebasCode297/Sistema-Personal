import React, { useState, useEffect, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import {
  notificacionesServicio,
  type Notificacion,
  type FormularioNotificacionDatos,
  type TipoNotificacion,
} from "../servicios/notificacionesServicio";
import "../notificaciones.css";

export const NotificacionesPagina: React.FC = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Formulario nueva alerta
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState<TipoNotificacion>("recordatorio");
  const [enlace, setEnlace] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) return;

    try {
      setGuardando(true);
      const datos: FormularioNotificacionDatos = {
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        tipo,
        enlace: enlace.trim() || undefined,
      };

      const nueva = await notificacionesServicio.crearNotificacion(datos);
      startTransition(() => {
        setNotificaciones((prev) => [nueva, ...prev]);
      });

      setTitulo("");
      setMensaje("");
      setTipo("recordatorio");
      setEnlace("");
      setModalAbierto(false);
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al crear notificación";
      alert(msj);
    } finally {
      setGuardando(false);
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
          <p>Avisos, recordatorios y notificaciones de tu sistema personal</p>
        </div>

        <div className="notificaciones-acciones-top">
          <button
            type="button"
            className="btn-accion-top primario"
            onClick={() => setModalAbierto(true)}
          >
            + Nueva Nota / Alerta
          </button>
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

      {/* Barra de Filtros */}
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

      {/* Lista de Notificaciones */}
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
            <p>No tienes notificaciones {soloNoLeidas ? "sin leer" : "en este momento"}.</p>
          </div>
        ) : (
          notificaciones.map((n) => (
            <article
              key={n.id}
              className={`notificacion-item ${!n.leida ? "no-leida" : ""} tipo-${n.tipo}`}
            >
              <div className="notificacion-cuerpo">
                <div className="notificacion-cabecera">
                  <span className={`badge-tipo ${n.tipo}`}>{n.tipo}</span>
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
                      Ir a {n.enlace}
                    </span>
                  )}
                  {!n.leida && <span style={{ fontWeight: 600, color: "#2563eb" }}>Nuevo</span>}
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

      {/* Modal Crear Alerta / Recordatorio */}
      {modalAbierto && (
        <div className="modal-overlay-noti" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenedor-noti" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Recordatorio / Alerta</h2>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setModalAbierto(false)}
              >
                [ X ]
              </button>
            </div>

            <form onSubmit={handleCrear}>
              <div className="form-grupo">
                <label htmlFor="noti-titulo">Título *</label>
                <input
                  id="noti-titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Pago de tarjeta, Revisión médica..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="noti-tipo">Tipo de Aviso</label>
                <select
                  id="noti-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoNotificacion)}
                >
                  <option value="recordatorio">Recordatorio</option>
                  <option value="alerta">Alerta</option>
                  <option value="info">Información</option>
                  <option value="sistema">Sistema</option>
                </select>
              </div>

              <div className="form-grupo">
                <label htmlFor="noti-mensaje">Mensaje *</label>
                <textarea
                  id="noti-mensaje"
                  rows={3}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Detalle o nota que deseas recordar..."
                  required
                />
              </div>

              <div className="form-grupo">
                <label htmlFor="noti-enlace">Ruta Interna (Opcional)</label>
                <input
                  id="noti-enlace"
                  type="text"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  placeholder="Ej: /finanzas, /tareas, /metas..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario" disabled={guardando}>
                  {guardando ? "Creando..." : "Guardar Recordatorio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
