import React, { useState, useEffect } from "react";
import type { FormularioEventoDatos, Evento } from "../servicios/calendarioServicio";

interface Props {
  eventoEditar?: Evento | null;
  onGuardar: (datos: FormularioEventoDatos) => Promise<void>;
  onCerrar: () => void;
}

export const FormularioEvento: React.FC<Props> = ({
  eventoEditar,
  onGuardar,
  onCerrar,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [todoElDia, setTodoElDia] = useState(false);
  const [categoria, setCategoria] = useState("general");
  const [ubicacion, setUbicacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formatear fecha para datetime-local (YYYY-MM-DDTHH:mm)
  function formatearParaInput(fechaIso?: string | null): string {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = fecha.getFullYear();
    const mm = pad(fecha.getMonth() + 1);
    const dd = pad(fecha.getDate());
    const hh = pad(fecha.getHours());
    const mi = pad(fecha.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  useEffect(() => {
    if (eventoEditar) {
      setTitulo(eventoEditar.titulo || "");
      setDescripcion(eventoEditar.descripcion || "");
      setFechaInicio(formatearParaInput(eventoEditar.fecha_inicio));
      setFechaFin(formatearParaInput(eventoEditar.fecha_fin));
      setTodoElDia(Boolean(eventoEditar.todo_el_dia));
      setCategoria(eventoEditar.categoria || "general");
      setUbicacion(eventoEditar.ubicacion || "");
    } else {
      // Fecha por defecto: hoy a la hora actual redondeada
      const ahora = new Date();
      ahora.setMinutes(0, 0, 0);
      setFechaInicio(formatearParaInput(ahora.toISOString()));
      const enUnaHora = new Date(ahora.getTime() + 60 * 60 * 1000);
      setFechaFin(formatearParaInput(enUnaHora.toISOString()));
      setTitulo("");
      setDescripcion("");
      setTodoElDia(false);
      setCategoria("general");
      setUbicacion("");
    }
  }, [eventoEditar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError("El título del evento es obligatorio.");
      return;
    }

    if (!fechaInicio) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }

    try {
      setGuardando(true);
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
        todo_el_dia: todoElDia,
        categoria,
        ubicacion: ubicacion.trim() || undefined,
      });
      onCerrar();
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al guardar el evento";
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{eventoEditar ? "Editar Evento" : "Nuevo Evento"}</h2>
          <button type="button" className="btn-cerrar-modal" onClick={onCerrar}>
            [ X ]
          </button>
        </div>

        {error && <div className="form-alerta-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grupo">
            <label htmlFor="evento-titulo">Título del Evento *</label>
            <input
              id="evento-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Reunión de proyecto, Cita médica..."
              required
              autoFocus
            />
          </div>

          <div className="form-fila-doble">
            <div className="form-grupo">
              <label htmlFor="evento-categoria">Categoría</label>
              <select
                id="evento-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="general">General</option>
                <option value="trabajo">Trabajo</option>
                <option value="personal">Personal</option>
                <option value="importante">Importante</option>
              </select>
            </div>

            <div className="form-grupo">
              <label htmlFor="evento-ubicacion">Ubicación / Enlace</label>
              <input
                id="evento-ubicacion"
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Google Meet, Oficina, etc."
              />
            </div>
          </div>

          <div className="form-fila-doble">
            <div className="form-grupo">
              <label htmlFor="evento-inicio">Fecha y Hora de Inicio *</label>
              <input
                id="evento-inicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="evento-fin">Fecha y Hora de Fin</label>
              <input
                id="evento-fin"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grupo">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={todoElDia}
                onChange={(e) => setTodoElDia(e.target.checked)}
              />
              Evento de todo el día
            </label>
          </div>

          <div className="form-grupo">
            <label htmlFor="evento-descripcion">Descripción o Notas</label>
            <textarea
              id="evento-descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles adicionales, recordatorios..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secundario"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? "Guardando..." : eventoEditar ? "Actualizar Evento" : "Crear Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
