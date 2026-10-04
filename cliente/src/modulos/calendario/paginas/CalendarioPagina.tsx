import React, { useState, useEffect, useTransition } from "react";
import {
  calendarioServicio,
  type Evento,
  type FormularioEventoDatos,
} from "../servicios/calendarioServicio";
import { FormularioEvento } from "../componentes/FormularioEvento";
import "../calendario.css";

export const CalendarioPagina: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroTiempo, setFiltroTiempo] = useState<"proximos" | "todos" | "pasados">("proximos");

  // Modal / Edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState<Evento | null>(null);

  const [, startTransition] = useTransition();

  async function cargarEventos() {
    try {
      setCargando(true);
      setError(null);
      const datos = await calendarioServicio.obtenerEventos();
      setEventos(datos);
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al cargar eventos";
      setError(msj);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  function abrirModalNuevo() {
    setEventoAEditar(null);
    setModalAbierto(true);
  }

  function abrirModalEditar(evento: Evento) {
    setEventoAEditar(evento);
    setModalAbierto(true);
  }

  async function handleGuardarEvento(datos: FormularioEventoDatos) {
    if (eventoAEditar) {
      const eventoActualizado = await calendarioServicio.actualizarEvento(eventoAEditar.id, datos);
      startTransition(() => {
        setEventos((prev) =>
          prev.map((e) => (e.id === eventoActualizado.id ? eventoActualizado : e))
        );
      });
    } else {
      const nuevoEvento = await calendarioServicio.crearEvento(datos);
      startTransition(() => {
        setEventos((prev) => [...prev, nuevoEvento].sort((a, b) =>
          new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
        ));
      });
    }
  }

  async function handleEliminarEvento(id: number) {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este evento?");
    if (!confirmar) return;

    try {
      await calendarioServicio.eliminarEvento(id);
      startTransition(() => {
        setEventos((prev) => prev.filter((e) => e.id !== id));
      });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al eliminar evento";
      alert(msj);
    }
  }

  // Formateador de fechas legible
  function formatearFecha(fechaIso: string, todoElDia: boolean): string {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return fechaIso;

    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const fechaStr = d.toLocaleDateString("es-ES", opcionesFecha);
    if (todoElDia) {
      return `${fechaStr} (Todo el día)`;
    }

    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const horaStr = d.toLocaleTimeString("es-ES", opcionesHora);
    return `${fechaStr} a las ${horaStr}`;
  }

  // Filtrado de eventos
  const ahora = new Date().getTime();
  const eventosFiltrados = eventos.filter((evento) => {
    // Filtro categoría
    if (filtroCategoria !== "todas" && evento.categoria !== filtroCategoria) {
      return false;
    }

    // Filtro tiempo
    const tiempoEvento = new Date(evento.fecha_inicio).getTime();
    if (filtroTiempo === "proximos") {
      // Eventos desde hace 2 horas en adelante
      return tiempoEvento >= ahora - 2 * 60 * 60 * 1000;
    }
    if (filtroTiempo === "pasados") {
      return tiempoEvento < ahora - 2 * 60 * 60 * 1000;
    }
    return true;
  });

  return (
    <div className="calendario-pagina">
      <header className="calendario-header">
        <div className="calendario-titulo-area">
          <h1>Calendario y Eventos</h1>
          <p>Organiza tus actividades, citas, reuniones y recordatorios personales</p>
        </div>

        <div className="calendario-acciones-top">
          <button type="button" className="btn-crear-evento" onClick={abrirModalNuevo}>
            + Nuevo Evento
          </button>
        </div>
      </header>

      {/* Barra de filtros */}
      <section className="calendario-filtros-barra">
        <div className="calendario-filtro-categorias">
          <button
            type="button"
            className={`btn-filtro-cat ${filtroCategoria === "todas" ? "activo" : ""}`}
            onClick={() => setFiltroCategoria("todas")}
          >
            Todas
          </button>
          <button
            type="button"
            className={`btn-filtro-cat ${filtroCategoria === "general" ? "activo" : ""}`}
            onClick={() => setFiltroCategoria("general")}
          >
            General
          </button>
          <button
            type="button"
            className={`btn-filtro-cat ${filtroCategoria === "trabajo" ? "activo" : ""}`}
            onClick={() => setFiltroCategoria("trabajo")}
          >
            Trabajo
          </button>
          <button
            type="button"
            className={`btn-filtro-cat ${filtroCategoria === "personal" ? "activo" : ""}`}
            onClick={() => setFiltroCategoria("personal")}
          >
            Personal
          </button>
          <button
            type="button"
            className={`btn-filtro-cat ${filtroCategoria === "importante" ? "activo" : ""}`}
            onClick={() => setFiltroCategoria("importante")}
          >
            Importante
          </button>
        </div>

        <div className="calendario-vista-toggle">
          <button
            type="button"
            className={`btn-vista-toggle ${filtroTiempo === "proximos" ? "activo" : ""}`}
            onClick={() => setFiltroTiempo("proximos")}
          >
            Próximos
          </button>
          <button
            type="button"
            className={`btn-vista-toggle ${filtroTiempo === "todos" ? "activo" : ""}`}
            onClick={() => setFiltroTiempo("todos")}
          >
            Todos
          </button>
          <button
            type="button"
            className={`btn-vista-toggle ${filtroTiempo === "pasados" ? "activo" : ""}`}
            onClick={() => setFiltroTiempo("pasados")}
          >
            Pasados
          </button>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="calendario-contenedor-principal">
        {cargando ? (
          <div className="eventos-lista-vacia">
            <p>Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="form-alerta-error">
            <p>{error}</p>
            <button
              type="button"
              className="btn-secundario"
              onClick={cargarEventos}
              style={{ marginTop: "0.5rem" }}
            >
              Reintentar
            </button>
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="eventos-lista-vacia">
            <p>
              {filtroTiempo === "proximos"
                ? "No tienes próximos eventos programados."
                : "No se encontraron eventos con estos filtros."}
            </p>
            <button type="button" className="btn-primario" onClick={abrirModalNuevo}>
              + Crear mi primer evento
            </button>
          </div>
        ) : (
          <div className="eventos-grid">
            {eventosFiltrados.map((evento) => (
              <article
                key={evento.id}
                className={`evento-tarjeta cat-${evento.categoria || "general"}`}
              >
                <div>
                  <div className="evento-header">
                    <h2 className="evento-titulo">{evento.titulo}</h2>
                    <span className={`badge-cat cat-${evento.categoria || "general"}`}>
                      {evento.categoria || "general"}
                    </span>
                  </div>

                  <div className="evento-detalles">
                    <div className="evento-dato-fila">
                      <span className="evento-etiqueta-txt">Inicio:</span>
                      <span className="evento-valor-txt">
                        {formatearFecha(evento.fecha_inicio, evento.todo_el_dia)}
                      </span>
                    </div>

                    {evento.fecha_fin && !evento.todo_el_dia && (
                      <div className="evento-dato-fila">
                        <span className="evento-etiqueta-txt">Fin:</span>
                        <span className="evento-valor-txt">
                          {formatearFecha(evento.fecha_fin, false)}
                        </span>
                      </div>
                    )}

                    {evento.ubicacion && (
                      <div className="evento-dato-fila">
                        <span className="evento-etiqueta-txt">Lugar:</span>
                        <span className="evento-valor-txt">{evento.ubicacion}</span>
                      </div>
                    )}

                    {evento.descripcion && (
                      <div className="evento-descripcion">{evento.descripcion}</div>
                    )}
                  </div>
                </div>

                <div className="evento-acciones-footer">
                  <button
                    type="button"
                    className="btn-accion-evento"
                    onClick={() => abrirModalEditar(evento)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-accion-evento btn-eliminar"
                    onClick={() => handleEliminarEvento(evento.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <FormularioEvento
          eventoEditar={eventoAEditar}
          onGuardar={handleGuardarEvento}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};
