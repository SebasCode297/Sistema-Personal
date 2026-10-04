import React, { useCallback, useEffect, useState } from "react";
import { metasServicio, type Meta, type FormularioMeta as DatosMeta, type EstadoMeta } from "../servicios/metasServicio";
import { FormularioMeta } from "../componentes/FormularioMeta";
import "../metas.css";

const etiquetasEstado: Record<EstadoMeta, string> = {
  activa: "Activa",
  pausada: "Pausada",
  completada: "Completada",
  abandonada: "Abandonada",
};

export const MetasPagina: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<(DatosMeta & { id: number }) | null>(null);
  const [progresoEditandoId, setProgresoEditandoId] = useState<number | null>(null);
  const [valorProgresoTemp, setValorProgresoTemp] = useState<string>("");

  // Resumen
  const [resumen, setResumen] = useState({ activas: 0, completadas: 0, pausadas: 0, total: 0 });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resMetas, resResumen] = await Promise.all([
        metasServicio.obtenerMetas(filtroEstado || undefined),
        metasServicio.resumenMetas(),
      ]);
      if (resMetas.ok) setMetas(resMetas.metas);
      if (resResumen.ok) {
        setResumen({
          activas: parseInt(resResumen.resumen.activas),
          completadas: parseInt(resResumen.resumen.completadas),
          pausadas: parseInt(resResumen.resumen.pausadas),
          total: parseInt(resResumen.resumen.total),
        });
      }
    } catch (e) {
      console.error("Error al cargar metas:", e);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  async function handleGuardar(datos: DatosMeta) {
    if (editando) {
      await metasServicio.actualizarMeta(editando.id, datos);
      setEditando(null);
    } else {
      await metasServicio.crearMeta(datos);
    }
    await cargarDatos();
  }

  async function handleEliminar(id: number) {
    if (!window.confirm("¿Eliminar esta meta?")) return;
    await metasServicio.eliminarMeta(id);
    if (editando?.id === id) setEditando(null);
    await cargarDatos();
  }

  async function handleActualizarProgreso(id: number) {
    const valor = parseFloat(valorProgresoTemp.replace(",", "."));
    if (isNaN(valor) || valor < 0) return;
    await metasServicio.actualizarProgreso(id, valor);
    setProgresoEditandoId(null);
    setValorProgresoTemp("");
    await cargarDatos();
  }

  function calcularPorcentaje(meta: Meta) {
    const objetivo = parseFloat(meta.valor_objetivo);
    const actual = parseFloat(meta.valor_actual);
    if (objetivo === 0) return 0;
    return Math.min(100, Math.round((actual / objetivo) * 100));
  }

  function formatearFecha(fecha: string | null) {
    if (!fecha) return null;
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  function iniciarEdicion(meta: Meta) {
    setEditando({
      id: meta.id,
      titulo: meta.titulo,
      descripcion: meta.descripcion || "",
      valor_objetivo: parseFloat(meta.valor_objetivo),
      valor_actual: parseFloat(meta.valor_actual),
      unidad: meta.unidad,
      estado: meta.estado,
      fecha_inicio: meta.fecha_inicio.split("T")[0],
      fecha_fin: meta.fecha_fin ? meta.fecha_fin.split("T")[0] : null,
    });
    setProgresoEditandoId(null);
  }

  return (
    <div>
      {/* Encabezado */}
      <header className="metas-header">
        <div>
          <span className="metas-insignia">Módulo Independiente — Fase 6</span>
          <h1 className="metas-titulo">Metas Personales</h1>
          <p className="metas-subtitulo">Seguimiento de objetivos con progreso visual. Independiente de otros módulos.</p>
        </div>
        <div className="metas-filtro">
          <label htmlFor="filtro-estado-meta">Filtrar:</label>
          <select
            id="filtro-estado-meta"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setEditando(null); }}
          >
            <option value="">Todas</option>
            <option value="activa">Activas</option>
            <option value="pausada">Pausadas</option>
            <option value="completada">Completadas</option>
            <option value="abandonada">Abandonadas</option>
          </select>
        </div>
      </header>

      {/* Resumen */}
      <div className="metas-resumen-grid">
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Activas</span>
          <span className="metas-res-valor activas">{resumen.activas}</span>
        </div>
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Completadas</span>
          <span className="metas-res-valor completadas">{resumen.completadas}</span>
        </div>
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Pausadas</span>
          <span className="metas-res-valor pausadas">{resumen.pausadas}</span>
        </div>
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Total</span>
          <span className="metas-res-valor total">{resumen.total}</span>
        </div>
      </div>

      {/* Cuerpo: grid metas + formulario */}
      <div className="metas-cuerpo">
        {/* Lista de metas */}
        <div className="metas-lista-panel">
          {cargando ? (
            <div className="metas-cargando"><div className="spinner"></div>Cargando metas...</div>
          ) : metas.length === 0 ? (
            <div className="metas-empty">No hay metas con este filtro. Crea tu primera meta.</div>
          ) : (
            <div className="metas-grid">
              {metas.map((meta) => {
                const pct = calcularPorcentaje(meta);
                const estaEditandoProgreso = progresoEditandoId === meta.id;

                return (
                  <article key={meta.id} className={`meta-tarjeta ${meta.estado}`}>
                    {/* Cabecera */}
                    <div className="meta-tarjeta-header">
                      <span className="meta-tarjeta-titulo">{meta.titulo}</span>
                      <span className={`meta-badge-estado ${meta.estado}`}>{etiquetasEstado[meta.estado]}</span>
                    </div>

                    {/* Descripción */}
                    {meta.descripcion && (
                      <p className="meta-descripcion">{meta.descripcion}</p>
                    )}

                    {/* Barra de progreso */}
                    <div className="meta-progreso-contenedor">
                      <div className="meta-progreso-datos">
                        <span className="meta-progreso-porcentaje">{pct}%</span>
                        <span className="meta-progreso-texto">
                          {parseFloat(meta.valor_actual)} / {parseFloat(meta.valor_objetivo)} {meta.unidad}
                        </span>
                      </div>
                      <div className="meta-barra-bg">
                        <div
                          className={`meta-barra-fill ${meta.estado}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Edición rápida de progreso */}
                    {estaEditandoProgreso ? (
                      <div className="meta-progreso-edicion">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="campo-input"
                          value={valorProgresoTemp}
                          onChange={(e) => setValorProgresoTemp(e.target.value)}
                          placeholder={meta.valor_actual}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") handleActualizarProgreso(meta.id); }}
                        />
                        <button
                          type="button"
                          className="btn-primario"
                          onClick={() => handleActualizarProgreso(meta.id)}
                        >Guardar</button>
                        <button
                          type="button"
                          className="btn-secundario"
                          onClick={() => { setProgresoEditandoId(null); setValorProgresoTemp(""); }}
                        >X</button>
                      </div>
                    ) : null}

                    {/* Footer */}
                    <div className="meta-tarjeta-footer">
                      <span className="meta-fecha">
                        {formatearFecha(meta.fecha_inicio)}
                        {meta.fecha_fin ? ` — ${formatearFecha(meta.fecha_fin)}` : ""}
                      </span>
                      <div className="meta-acciones">
                        {meta.estado !== "completada" && meta.estado !== "abandonada" && (
                          <button
                            type="button"
                            className="btn-secundario btn-accion-tabla"
                            onClick={() => {
                              setProgresoEditandoId(meta.id);
                              setValorProgresoTemp(meta.valor_actual);
                            }}
                          >
                            Progreso
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-secundario btn-accion-tabla"
                          onClick={() => iniciarEdicion(meta)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-peligro btn-accion-tabla"
                          onClick={() => handleEliminar(meta.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel formulario */}
        <div className="metas-panel-accion">
          <h2 className="metas-panel-titulo">
            {editando ? "Editar meta" : "Nueva meta"}
          </h2>
          <FormularioMeta
            onGuardar={handleGuardar}
            editando={editando}
            onCancelarEdicion={() => setEditando(null)}
          />
        </div>
      </div>
    </div>
  );
};
