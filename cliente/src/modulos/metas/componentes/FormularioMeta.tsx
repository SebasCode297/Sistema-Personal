import React, { useState } from "react";
import type { FormularioMeta as DatosMeta, EstadoMeta } from "../servicios/metasServicio";

interface Props {
  onGuardar: (datos: DatosMeta) => Promise<void>;
  editando?: (DatosMeta & { id: number }) | null;
  onCancelarEdicion?: () => void;
}

export const FormularioMeta: React.FC<Props> = ({ onGuardar, editando, onCancelarEdicion }) => {
  const hoy = new Date().toISOString().split("T")[0];

  const [titulo, setTitulo] = useState(editando?.titulo || "");
  const [descripcion, setDescripcion] = useState(editando?.descripcion || "");
  const [valorObjetivo, setValorObjetivo] = useState(editando?.valor_objetivo?.toString() || "100");
  const [valorActual, setValorActual] = useState(editando?.valor_actual?.toString() || "0");
  const [unidad, setUnidad] = useState(editando?.unidad || "%");
  const [estado, setEstado] = useState<EstadoMeta>(editando?.estado || "activa");
  const [fechaInicio, setFechaInicio] = useState(editando?.fecha_inicio || hoy);
  const [fechaFin, setFechaFin] = useState(editando?.fecha_fin || "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || titulo.trim().length < 2) {
      setError("El título debe tener al menos 2 caracteres.");
      return;
    }
    if (isNaN(Number(valorObjetivo)) || Number(valorObjetivo) <= 0) {
      setError("El valor objetivo debe ser mayor a 0.");
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        valor_objetivo: Number(valorObjetivo),
        valor_actual: Number(valorActual) || 0,
        unidad: unidad.trim() || "%",
        estado,
        fecha_inicio: fechaInicio || hoy,
        fecha_fin: fechaFin || null,
      });

      if (!editando) {
        setTitulo("");
        setDescripcion("");
        setValorObjetivo("100");
        setValorActual("0");
        setUnidad("%");
        setEstado("activa");
        setFechaInicio(hoy);
        setFechaFin("");
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la meta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alerta alerta-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="campo-grupo">
        <label htmlFor="meta-titulo">Título</label>
        <input
          id="meta-titulo"
          type="text"
          className="campo-input"
          placeholder="Ej. Leer 12 libros este año"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={cargando}
          maxLength={200}
          required
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="meta-descripcion">Descripción (opcional)</label>
        <textarea
          id="meta-descripcion"
          className="campo-input"
          placeholder="Describe tu objetivo..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={cargando}
          rows={2}
          style={{ resize: "vertical", minHeight: "60px" }}
        />
      </div>

      {/* Objetivo y progreso en fila */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
        <div className="campo-grupo" style={{ paddingRight: "0.4rem" }}>
          <label htmlFor="meta-objetivo">Objetivo</label>
          <input
            id="meta-objetivo"
            type="number"
            min="0.01"
            step="any"
            className="campo-input"
            placeholder="100"
            value={valorObjetivo}
            onChange={(e) => setValorObjetivo(e.target.value)}
            disabled={cargando}
            required
          />
        </div>
        <div className="campo-grupo" style={{ paddingLeft: "0.4rem" }}>
          <label htmlFor="meta-actual">Actual</label>
          <input
            id="meta-actual"
            type="number"
            min="0"
            step="any"
            className="campo-input"
            placeholder="0"
            value={valorActual}
            onChange={(e) => setValorActual(e.target.value)}
            disabled={cargando}
          />
        </div>
      </div>

      <div className="campo-grupo">
        <label htmlFor="meta-unidad">Unidad de medida</label>
        <input
          id="meta-unidad"
          type="text"
          className="campo-input"
          placeholder="%, km, libros, días..."
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          disabled={cargando}
          maxLength={50}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="meta-estado">Estado</label>
        <select
          id="meta-estado"
          className="campo-input"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoMeta)}
          disabled={cargando}
          style={{ appearance: "auto" }}
        >
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="completada">Completada</option>
          <option value="abandonada">Abandonada</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
        <div className="campo-grupo" style={{ paddingRight: "0.4rem" }}>
          <label htmlFor="meta-inicio">Inicio</label>
          <input
            id="meta-inicio"
            type="date"
            className="campo-input"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="campo-grupo" style={{ paddingLeft: "0.4rem" }}>
          <label htmlFor="meta-fin">Fecha fin</label>
          <input
            id="meta-fin"
            type="date"
            className="campo-input"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={cargando}
          />
        </div>
      </div>

      <button type="submit" className="btn-primario" style={{ width: "100%", marginTop: "0.5rem" }} disabled={cargando}>
        {cargando ? <><span className="spinner"></span>Guardando...</> : editando ? "Actualizar meta" : "Crear meta"}
      </button>

      {editando && onCancelarEdicion && (
        <button
          type="button"
          className="btn-secundario"
          onClick={onCancelarEdicion}
          disabled={cargando}
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          Cancelar
        </button>
      )}
    </form>
  );
};
