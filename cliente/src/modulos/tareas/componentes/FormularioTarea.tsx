import React, { useEffect, useState } from "react";
import type { EstadoTarea, FormularioTarea as DatosTarea, PrioridadTarea, Tarea } from "../servicios/tareasServicio";

interface Props {
  onGuardar: (datos: DatosTarea) => Promise<void>;
  editando?: Tarea | null;
  onCancelarEdicion?: () => void;
}

export const FormularioTarea: React.FC<Props> = ({
  onGuardar,
  editando,
  onCancelarEdicion,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadTarea>("media");
  const [fechaLimite, setFechaLimite] = useState("");
  const [estado, setEstado] = useState<EstadoTarea>("pendiente");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(editando?.titulo || "");
    setDescripcion(editando?.descripcion || "");
    setPrioridad(editando?.prioridad || "media");
    setFechaLimite(editando?.fecha_limite ? editando.fecha_limite.split("T")[0] : "");
    setEstado(editando?.estado || "pendiente");
    setError(null);
  }, [editando]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (titulo.trim().length < 2) {
      setError("El título debe tener al menos 2 caracteres.");
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        prioridad,
        fecha_limite: fechaLimite || null,
        estado,
      });
      if (!editando) {
        setTitulo("");
        setDescripcion("");
        setPrioridad("media");
        setFechaLimite("");
        setEstado("pendiente");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la tarea.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tareas-formulario">
      {error ? <div className="alerta alerta-error">{error}</div> : null}

      <div className="campo-grupo">
        <label htmlFor="tarea-titulo">Título</label>
        <input
          id="tarea-titulo"
          type="text"
          className="campo-input"
          placeholder="Ej. Pagar servicios"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={cargando}
          maxLength={200}
          required
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-descripcion">Descripción</label>
        <textarea
          id="tarea-descripcion"
          className="campo-input"
          placeholder="Detalles opcionales"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={cargando}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-prioridad">Prioridad</label>
        <select
          id="tarea-prioridad"
          className="campo-input"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
          disabled={cargando}
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-fecha">Fecha límite</label>
        <input
          id="tarea-fecha"
          type="date"
          className="campo-input"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          disabled={cargando}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-estado">Estado</label>
        <select
          id="tarea-estado"
          className="campo-input"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoTarea)}
          disabled={cargando}
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      <button type="submit" className="btn-primario" disabled={cargando} style={{ width: "100%" }}>
        {cargando ? "Guardando..." : editando ? "Actualizar tarea" : "Crear tarea"}
      </button>

      {editando && onCancelarEdicion ? (
        <button
          type="button"
          className="btn-secundario"
          onClick={onCancelarEdicion}
          disabled={cargando}
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          Cancelar
        </button>
      ) : null}
    </form>
  );
};
