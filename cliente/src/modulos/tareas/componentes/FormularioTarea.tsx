import React, { useEffect, useState } from "react";
import type { FormularioTarea as DatosTarea, Tarea } from "../servicios/tareasServicio";

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
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(editando?.titulo || "");
    setDescripcion(editando?.descripcion || "");
    setFechaInicio(editando?.fecha_inicio ? editando.fecha_inicio.split("T")[0] : "");
    const fin = editando?.fecha_fin || editando?.fecha_limite;
    setFechaFin(fin ? fin.split("T")[0] : "");
    setMonto(editando?.monto !== null && editando?.monto !== undefined ? String(editando.monto) : "");
    setError(null);
  }, [editando]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (titulo.trim().length < 2) {
      setError("El título debe tener al menos 2 caracteres.");
      return;
    }

    const numMonto = monto ? parseFloat(monto) : null;
    if (numMonto !== null && (isNaN(numMonto) || numMonto < 0)) {
      setError("El valor a pagar debe ser un número mayor o igual a 0.");
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        fecha_limite: fechaFin || null,
        estado: "pendiente",
        monto: numMonto,
      });
      if (!editando) {
        setTitulo("");
        setDescripcion("");
        setFechaInicio("");
        setFechaFin("");
        setMonto("");
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
        <label htmlFor="tarea-titulo">Título de la Tarea *</label>
        <input
          id="tarea-titulo"
          type="text"
          className="campo-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={cargando}
          maxLength={200}
          required
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-descripcion">Descripción (opcional)</label>
        <textarea
          id="tarea-descripcion"
          className="campo-input"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={cargando}
          rows={2}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tarea-monto">Valor / Monto a pagar ($)</label>
        <input
          id="tarea-monto"
          type="number"
          step="0.01"
          min="0"
          className="campo-input"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          disabled={cargando}
        />
      </div>

      {/* Fecha de inicio y Fecha de fin en 2 columnas */}
      <div className="form-fila-2">
        <div className="campo-grupo">
          <label htmlFor="tarea-inicio">Fecha de inicio</label>
          <input
            id="tarea-inicio"
            type="date"
            className="campo-input"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="campo-grupo">
          <label htmlFor="tarea-fin">Fecha de fin</label>
          <input
            id="tarea-fin"
            type="date"
            className="campo-input"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={cargando}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        {editando && onCancelarEdicion && (
          <button
            type="button"
            className="btn-secundario"
            onClick={onCancelarEdicion}
            disabled={cargando}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="btn-primario"
          disabled={cargando}
          style={{ flex: 1 }}
        >
          {cargando ? "Guardando..." : editando ? "Actualizar Tarea" : "Crear Tarea"}
        </button>
      </div>
    </form>
  );
};
