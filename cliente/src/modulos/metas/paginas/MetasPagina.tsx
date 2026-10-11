import React, { useCallback, useEffect, useState } from "react";
import { metasServicio, type Meta, type FormularioMeta as DatosMeta } from "../servicios/metasServicio";
import { FormularioMeta } from "../componentes/FormularioMeta";
import "../metas.css";

export const MetasPagina: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<(DatosMeta & { id: number }) | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const resMetas = await metasServicio.obtenerMetas();
      if (resMetas.ok) setMetas(resMetas.metas);
    } catch (e) {
      console.error("Error al cargar metas:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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

  function formatearFecha(fecha: string | null) {
    if (!fecha) return null;
    const soloFecha = fecha.split("T")[0];
    const partes = soloFecha.split("-");
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      const d = new Date(anio, mes, dia);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    const d = new Date(fecha);
    return isNaN(d.getTime())
      ? null
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  function iniciarEdicion(meta: Meta) {
    setEditando({
      id: meta.id,
      titulo: meta.titulo,
      descripcion: meta.descripcion || undefined,
      fecha_fin: meta.fecha_fin ? meta.fecha_fin.split("T")[0] : null,
    });
    setModalAbierto(true);
  }

  return (
    <div className="metas-pagina">
      {/* Encabezado */}
      <header className="metas-header">
        <div>
          <h1 className="metas-titulo">Metas Personales</h1>
          <p className="metas-subtitulo">Planifica y cumple tus objetivos y metas personales</p>
        </div>
        <div className="metas-acciones-top">
          <button
            type="button"
            className="btn-crear-accion"
            onClick={() => {
              setEditando(null);
              setModalAbierto(true);
            }}
          >
            + Nueva Meta
          </button>
        </div>
      </header>

      {/* Resumen */}
      <div className="metas-resumen-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Total de Metas</span>
          <span className="metas-res-valor activas">{metas.length}</span>
        </div>
        <div className="metas-tarjeta-resumen">
          <span className="metas-res-etiqueta">Con Fecha Límite</span>
          <span className="metas-res-valor total">
            {metas.filter((m) => !!m.fecha_fin).length}
          </span>
        </div>
      </div>

      {/* Lista de metas */}
      <div className="metas-cuerpo">
        <div className="metas-lista-panel">
          {cargando ? (
            <div className="metas-cargando">
              <div className="spinner"></div>Cargando metas...
            </div>
          ) : metas.length === 0 ? (
            <div className="metas-empty">No tienes metas registradas. ¡Crea tu primera meta!</div>
          ) : (
            <div className="metas-grid">
              {metas.map((meta) => (
                <article key={meta.id} className="meta-tarjeta activa">
                  {/* Cabecera */}
                  <div className="meta-tarjeta-header">
                    <span className="meta-tarjeta-titulo">{meta.titulo}</span>
                  </div>

                  {/* Descripción */}
                  {meta.descripcion && (
                    <p className="meta-descripcion" style={{ color: "var(--texto-secundario)", fontSize: "0.9rem" }}>
                      {meta.descripcion}
                    </p>
                  )}

                  {/* Fecha Límite */}
                  <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--borde-suave)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--texto-secundario)", marginBottom: "0.5rem" }}>
                      <strong>Fecha límite: </strong>
                      {meta.fecha_fin ? formatearFecha(meta.fecha_fin) : "Sin fecha asignada"}
                    </div>

                    {/* Acciones */}
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Meta */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => { setModalAbierto(false); setEditando(null); }}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? "Editar Meta" : "Nueva Meta"}</h2>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => { setModalAbierto(false); setEditando(null); }}
              >
                ✕
              </button>
            </div>
            <FormularioMeta
              onGuardar={async (datos) => {
                await handleGuardar(datos);
                setModalAbierto(false);
                setEditando(null);
              }}
              editando={editando}
              onCancelarEdicion={() => {
                setModalAbierto(false);
                setEditando(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
