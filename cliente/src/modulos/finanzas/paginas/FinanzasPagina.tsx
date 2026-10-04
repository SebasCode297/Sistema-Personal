import React, { useEffect, useState, useCallback } from "react";
import {
  finanzasServicio,
  type Ingreso,
  type Gasto,
  type Categoria,
  type GastoPorCategoria,
  type EvolucionMensual,
  type FormularioMovimiento as DatosMovimiento,
} from "../servicios/finanzasServicio";
import { FormularioMovimiento } from "../componentes/FormularioMovimiento";
import "../finanzas.css";

type TipoVista = "ingresos" | "gastos";
type TipoFormulario = "ingreso" | "gasto";

type Editando = ({ id: number } & DatosMovimiento) | null;

export const FinanzasPagina: React.FC = () => {
  const mesActual = new Date().toISOString().slice(0, 7);
  const [mes, setMes] = useState(mesActual);
  const [vistaActiva, setVistaActiva] = useState<TipoVista>("ingresos");
  const [tipoFormulario, setTipoFormulario] = useState<TipoFormulario>("ingreso");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [gastosCategoria, setGastosCategoria] = useState<GastoPorCategoria[]>([]);
  const [evolucion, setEvolucion] = useState<EvolucionMensual[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Editando>(null);

  const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resCats, resIngresos, resGastos, resCatsGasto, resEvo] = await Promise.all([
        finanzasServicio.obtenerCategorias(),
        finanzasServicio.obtenerIngresos(mes),
        finanzasServicio.obtenerGastos(mes),
        finanzasServicio.gastosPorCategoria(mes),
        finanzasServicio.evolucionMensual(),
      ]);

      if (resCats.ok) setCategorias(resCats.categorias);
      if (resIngresos.ok) setIngresos(resIngresos.ingresos);
      if (resGastos.ok) setGastos(resGastos.gastos);
      if (resCatsGasto.ok) setGastosCategoria(resCatsGasto.datos);
      if (resEvo.ok) setEvolucion(resEvo.datos);
    } catch (e) {
      console.error("Error al cargar finanzas:", e);
    } finally {
      setCargando(false);
    }
  }, [mes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const totalIngresos = ingresos.reduce((acc, item) => acc + parseFloat(item.monto), 0);
  const totalGastos = gastos.reduce((acc, item) => acc + parseFloat(item.monto), 0);
  const balance = totalIngresos - totalGastos;
  const maxEvolucion = Math.max(
    1,
    ...evolucion.map((fila) => Math.max(parseFloat(fila.ingresos), parseFloat(fila.gastos)))
  );
  const maxCategoria = Math.max(1, ...gastosCategoria.map((fila) => parseFloat(fila.total)));

  async function handleGuardar(datos: DatosMovimiento) {
    if (editando) {
      if (vistaActiva === "ingresos") {
        await finanzasServicio.actualizarIngreso(editando.id, datos);
      } else {
        await finanzasServicio.actualizarGasto(editando.id, datos);
      }
      setEditando(null);
    } else {
      if (tipoFormulario === "ingreso") {
        await finanzasServicio.crearIngreso(datos);
      } else {
        await finanzasServicio.crearGasto(datos);
      }
    }
    await cargarDatos();
  }

  async function handleEliminar(id: number, tipo: TipoVista) {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    if (tipo === "ingresos") {
      await finanzasServicio.eliminarIngreso(id);
    } else {
      await finanzasServicio.eliminarGasto(id);
    }
    await cargarDatos();
  }

  function iniciarEdicion(item: Ingreso | Gasto) {
    setVistaActiva(vistaActiva);
    setEditando({
      id: item.id,
      monto: parseFloat(item.monto),
      descripcion: item.descripcion || "",
      categoria_id: item.categoria_id,
      fecha: item.fecha.split("T")[0],
    });
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const listaActiva = vistaActiva === "ingresos" ? ingresos : gastos;

  return (
    <div>
      {/* Encabezado */}
      <header className="finanzas-header">
        <div className="finanzas-header-izq">
          <span className="finanzas-insignia">Módulo Independiente — Fase 4</span>
          <h1 className="finanzas-titulo">Finanzas Personales</h1>
          <p className="finanzas-subtitulo">Control de ingresos y gastos. Sin dependencias de otros módulos.</p>
        </div>
        <div className="finanzas-filtro-mes">
          <label htmlFor="filtro-mes">Ver mes:</label>
          <input
            id="filtro-mes"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>
      </header>

      {/* Tarjetas de resumen */}
      <div className="finanzas-resumen-grid">
        <div className="finanzas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Ingresos del mes</span>
          <span className="tarjeta-resumen-monto positivo">{fmt.format(totalIngresos)}</span>
          <span className="tarjeta-resumen-subtexto">{ingresos.length} movimiento{ingresos.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="finanzas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Gastos del mes</span>
          <span className="tarjeta-resumen-monto negativo">{fmt.format(totalGastos)}</span>
          <span className="tarjeta-resumen-subtexto">{gastos.length} movimiento{gastos.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="finanzas-tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Balance del mes</span>
          <span className={`tarjeta-resumen-monto ${balance >= 0 ? "positivo" : "negativo"}`}>
            {fmt.format(balance)}
          </span>
          <span className="tarjeta-resumen-subtexto">
            {balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
          </span>
        </div>
      </div>

      <div className="finanzas-estadisticas">
        <article className="finanzas-panel-estadistica">
          <h2 className="finanzas-panel-titulo">Gastos por categoría</h2>
          {gastosCategoria.length === 0 ? (
            <p className="finanzas-empty">Sin gastos categorizados en este mes.</p>
          ) : (
            <ul className="finanzas-barras">
              {gastosCategoria.map((fila) => {
                const total = parseFloat(fila.total);
                return (
                  <li key={fila.categoria} className="finanzas-barra-item">
                    <div className="finanzas-barra-meta">
                      <span>{fila.categoria}</span>
                      <span>{fmt.format(total)} · {fila.cantidad}</span>
                    </div>
                    <div className="finanzas-barra-fondo">
                      <div
                        className="finanzas-barra-valor gasto"
                        style={{ width: `${(total / maxCategoria) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="finanzas-panel-estadistica">
          <h2 className="finanzas-panel-titulo">Evolución mensual</h2>
          {evolucion.length === 0 ? (
            <p className="finanzas-empty">Aún no hay historial mensual.</p>
          ) : (
            <ul className="finanzas-evolucion">
              {evolucion.map((fila) => (
                <li key={fila.mes} className="finanzas-evolucion-item">
                  <span className="finanzas-evolucion-mes">{fila.mes}</span>
                  <div className="finanzas-evolucion-columnas">
                    <div
                      className="finanzas-evolucion-col ingreso"
                      style={{ height: `${(parseFloat(fila.ingresos) / maxEvolucion) * 100}%` }}
                      title={`Ingresos ${fmt.format(parseFloat(fila.ingresos))}`}
                    />
                    <div
                      className="finanzas-evolucion-col gasto"
                      style={{ height: `${(parseFloat(fila.gastos) / maxEvolucion) * 100}%` }}
                      title={`Gastos ${fmt.format(parseFloat(fila.gastos))}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {/* Cuerpo principal: tabla + formulario */}
      <div className="finanzas-cuerpo">
        {/* Lista de movimientos */}
        <div className="finanzas-lista-panel">
          <div className="finanzas-lista-header">
            <div className="finanzas-tabs">
              <button
                type="button"
                className={`finanzas-tab ${vistaActiva === "ingresos" ? "activo" : ""}`}
                onClick={() => { setVistaActiva("ingresos"); setEditando(null); }}
              >
                Ingresos
              </button>
              <button
                type="button"
                className={`finanzas-tab ${vistaActiva === "gastos" ? "activo" : ""}`}
                onClick={() => { setVistaActiva("gastos"); setEditando(null); }}
              >
                Gastos
              </button>
            </div>
          </div>

          <div className="finanzas-tabla-contenedor">
            {cargando ? (
              <div className="finanzas-cargando">
                <div className="spinner"></div>
                <span>Cargando movimientos...</span>
              </div>
            ) : listaActiva.length === 0 ? (
              <div className="finanzas-empty">
                No hay {vistaActiva} registrados para este mes.
              </div>
            ) : (
              <table className="finanzas-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listaActiva.map((item) => (
                    <tr key={item.id}>
                      <td>{formatearFecha(item.fecha)}</td>
                      <td>{item.descripcion || <span style={{ color: "var(--texto-muted)" }}>Sin descripción</span>}</td>
                      <td>
                        {item.categoria_nombre ? (
                          <span className="celda-categoria">{item.categoria_nombre}</span>
                        ) : (
                          <span style={{ color: "var(--texto-muted)", fontSize: "0.82rem" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={vistaActiva === "ingresos" ? "celda-monto-ingreso" : "celda-monto-gasto"}>
                          {vistaActiva === "ingresos" ? "+" : "-"}{fmt.format(parseFloat(item.monto))}
                        </span>
                      </td>
                      <td>
                        <div className="celda-acciones">
                          <button
                            type="button"
                            className="btn-secundario btn-accion-tabla"
                            onClick={() => iniciarEdicion(item)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-peligro btn-accion-tabla"
                            onClick={() => handleEliminar(item.id, vistaActiva)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel del formulario */}
        <div className="finanzas-panel-accion">
          <h2 className="finanzas-panel-titulo">
            {editando ? `Editar ${vistaActiva === "ingresos" ? "ingreso" : "gasto"}` : "Nuevo movimiento"}
          </h2>
          <FormularioMovimiento
            categorias={categorias}
            tipo={editando ? (vistaActiva === "ingresos" ? "ingreso" : "gasto") : tipoFormulario}
            onTipoChange={(t) => {
              setTipoFormulario(t);
              setVistaActiva(t === "ingreso" ? "ingresos" : "gastos");
            }}
            onGuardar={handleGuardar}
            editando={editando}
            onCancelarEdicion={() => setEditando(null)}
          />
        </div>
      </div>
    </div>
  );
};
