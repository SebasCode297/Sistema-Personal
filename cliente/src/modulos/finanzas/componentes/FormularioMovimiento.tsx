import React, { useEffect, useState } from "react";
import type { Categoria, FormularioMovimiento as DatosFormulario } from "../servicios/finanzasServicio";

interface Props {
  categorias: Categoria[];
  tipo: "ingreso" | "gasto";
  onTipoChange: (tipo: "ingreso" | "gasto") => void;
  onGuardar: (datos: DatosFormulario) => Promise<void>;
  editando?: ({ id: number } & DatosFormulario) | null;
  onCancelarEdicion?: () => void;
}

export const FormularioMovimiento: React.FC<Props> = ({
  categorias,
  tipo,
  onTipoChange,
  onGuardar,
  editando,
  onCancelarEdicion,
}) => {
  const hoy = new Date().toISOString().split("T")[0];

  const [monto, setMonto] = useState(editando?.monto?.toString() || "");
  const [descripcion, setDescripcion] = useState(editando?.descripcion || "");
  const [categoriaId, setCategoriaId] = useState<string>(editando?.categoria_id?.toString() || "");
  const [fecha, setFecha] = useState(editando?.fecha || hoy);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMonto(editando?.monto?.toString() || "");
    setDescripcion(editando?.descripcion || "");
    setCategoriaId(editando?.categoria_id?.toString() || "");
    setFecha(editando?.fecha || hoy);
    setError(null);
  }, [editando, hoy]);

  const categoriasFiltradas = categorias.filter(
    (c) => c.tipo === tipo || c.tipo === "ambos"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto.replace(",", "."));
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser un número mayor a 0.");
      return;
    }
    if (!fecha) {
      setError("La fecha es obligatoria.");
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        monto: montoNum,
        descripcion: descripcion.trim() || undefined,
        categoria_id: categoriaId ? parseInt(categoriaId) : null,
        fecha,
      });
      // Limpiar formulario si es creación
      if (!editando) {
        setMonto("");
        setDescripcion("");
        setCategoriaId("");
        setFecha(hoy);
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el movimiento.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="finanzas-formulario">
      {/* Selector ingreso / gasto */}
      {!editando && (
        <div className="finanzas-tipo-selector" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={`btn-tipo ${tipo === "ingreso" ? "activo-ingreso" : ""}`}
            onClick={() => onTipoChange("ingreso")}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={`btn-tipo ${tipo === "gasto" ? "activo-gasto" : ""}`}
            onClick={() => onTipoChange("gasto")}
          >
            Gasto
          </button>
        </div>
      )}

      {error && (
        <div className="alerta alerta-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="campo-grupo">
        <label htmlFor="fin-monto">Monto</label>
        <input
          id="fin-monto"
          type="number"
          min="0.01"
          step="0.01"
          className="campo-input"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          disabled={cargando}
          required
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="fin-descripcion">Descripción (opcional)</label>
        <input
          id="fin-descripcion"
          type="text"
          className="campo-input"
          placeholder="Ej. Pago de nómina"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={cargando}
          maxLength={255}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="fin-categoria">Categoría</label>
        <select
          id="fin-categoria"
          className="campo-input"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          disabled={cargando}
          style={{ appearance: "auto" }}
        >
          <option value="">Sin categoría</option>
          {categoriasFiltradas.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-grupo">
        <label htmlFor="fin-fecha">Fecha</label>
        <input
          id="fin-fecha"
          type="date"
          className="campo-input"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={cargando}
          required
        />
      </div>

      <button
        type="submit"
        className={`btn-primario btn-guardar-movimiento ${tipo === "gasto" ? "" : ""}`}
        disabled={cargando}
        style={tipo === "gasto" ? {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
        } : {}}
      >
        {cargando ? (
          <><span className="spinner"></span><span>Guardando...</span></>
        ) : editando ? "Actualizar" : `Registrar ${tipo}`}
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
