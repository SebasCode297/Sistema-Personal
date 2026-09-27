import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { ResumenFinanzas } from "../componentes/ResumenFinanzas";
import { ResumenTareas } from "../componentes/ResumenTareas";
import { ResumenMetas } from "../componentes/ResumenMetas";
import { ResumenCalendario } from "../componentes/ResumenCalendario";
import { ResumenNotificaciones } from "../componentes/ResumenNotificaciones";
import "../dashboard.css";

export const DashboardPagina: React.FC = () => {
  const { usuario } = useAuth();

  // Fecha legible en español
  const fechaHoy = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const fechaFormateada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

  return (
    <div className="dashboard-contenedor">
      {/* Encabezado del Dashboard */}
      <header className="dashboard-header">
        <div className="dashboard-header-izq">
          <span className="dashboard-insignia">Fase 3 — Dashboard General</span>
          <h1 className="dashboard-titulo">
            Panel de Control — {usuario?.nombre || "Usuario"}
          </h1>
          <p className="dashboard-descripcion">
            Vista general centralizada. Los módulos operan de forma 100% independiente.
          </p>
        </div>
        <div className="dashboard-fecha-actual">
          {fechaFormateada}
        </div>
      </header>

      {/* Cuadrícula de Métricas Resumidas */}
      <section className="dashboard-grid-metricas" aria-label="Resumen de módulos">
        <ResumenFinanzas balance={0} />
        <ResumenTareas pendientes={0} />
        <ResumenMetas activas={0} />
        <ResumenCalendario eventosProximos={0} />
        <ResumenNotificaciones noLeidas={0} />
      </section>

      {/* Sección Informativa y Estado de los Módulos */}
      <section className="dashboard-seccion-modulos">
        <h2 className="dashboard-seccion-titulo">Estado de Módulos Independientes</h2>
        
        <div className="dashboard-grid-detalles">
          <div className="panel-detalle">
            <h3 className="panel-detalle-titulo">Mapa de Módulos del Sistema</h3>
            <ul className="lista-modulos-independientes">
              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">1. Configuración del Entorno</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Cliente Vite + TypeScript, Servidor Express y Base de Datos PostgreSQL.
                  </p>
                </div>
                <span className="item-modulo-estado listo">Completado</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">2. Autenticación y Seguridad</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Registro, Login, JWT, bcrypt y protección de rutas.
                  </p>
                </div>
                <span className="item-modulo-estado listo">Completado</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">3. Interfaz del Dashboard</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Estructura general responsive, métricas y diseño sin dependencias.
                  </p>
                </div>
                <span className="item-modulo-estado listo">Completado</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">4. Finanzas Personales</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Ingresos, gastos, categorías y balances independientes.
                  </p>
                </div>
                <span className="item-modulo-estado siguiente">Siguiente Fase</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">5. Gestión de Tareas</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    CRUD de tareas, estados, prioridades y fechas límite.
                  </p>
                </div>
                <span className="item-modulo-estado pendiente">Pendiente</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">6. Metas Personales</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Objetivos personales, progreso porcentual y valores.
                  </p>
                </div>
                <span className="item-modulo-estado pendiente">Pendiente</span>
              </li>

              <li className="item-modulo-independiente">
                <div>
                  <span className="item-modulo-nombre">7. Calendario de Eventos</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--texto-muted)", marginTop: "2px" }}>
                    Citas, reuniones, fechas y horas individuales.
                  </p>
                </div>
                <span className="item-modulo-estado pendiente">Pendiente</span>
              </li>
            </ul>
          </div>

          <div className="panel-detalle">
            <h3 className="panel-detalle-titulo">Regla de Arquitectura</h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
              Este Dashboard es únicamente una vista resumida de solo lectura para supervisión personal.
            </p>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--texto-muted)" }}>
              No mezcla la lógica interna de Finanzas con Tareas, ni Metas con Calendario. Cada módulo mantendrá su propio esquema en PostgreSQL, rutas API y componentes.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--borde-suave)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--texto-muted)" }}>
                Usuario conectado: <strong>{usuario?.email}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
