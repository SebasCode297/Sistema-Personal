import React, { useEffect, useState } from "react";
import type { FormularioMeta as DatosMeta, Meta } from "../servicios/metasServicio";

interface Props {
  onGuardar: (datos: DatosMeta) => Promise<void>;
  editando?: (DatosMeta & { id: number }) | Meta | null;
  onCancelarEdicion?: () => void;
}

export const FormularioMeta: React.FC<Props> = ({ onGuardar, editando, onCancelarEdicion }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(editando?.titulo || "");
    setDescripcion(editando?.descripcion || "");
    setFechaFin(editando?.fecha_fin ? String(editando.fecha_fin).split("T")[0] : "");
    setError(null);
  }, [editando]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || titulo.trim().length < 2) {
      setError("El título debe tener al menos 2 caracteres.");
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_fin: fechaFin || null,
      });

      if (!editando) {
        setTitulo("");
        setDescripcion("");
        setFechaFin("");
      }
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al guardar la meta.";
      setError(msj);
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="formulario-ordenado">
      {error && <div className="alerta alerta-error">{error}</div>}

      <div className="campo-grupo">
        <label htmlFor="meta-titulo">Nombre</label>
        <input
          id="meta-titulo"
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
        <label htmlFor="meta-descripcion">Descripción</label>
        <textarea
          id="meta-descripcion"
          className="campo-input"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={cargando}
          rows={2}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="meta-fin">Fecha límite</label>
        <input
          id="meta-fin"
          type="date"
          className="campo-input"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          disabled={cargando}
        />
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
          {cargando ? "Guardando..." : editando ? "Actualizar Meta" : "Crear Meta"}
        </button>
      </div>
    </form>
  );
};
