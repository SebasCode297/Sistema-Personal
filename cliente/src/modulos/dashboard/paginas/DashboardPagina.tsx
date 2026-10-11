import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ResumenTareas } from "../componentes/ResumenTareas";
import { ResumenMetas } from "../componentes/ResumenMetas";
import { ResumenNotificaciones } from "../componentes/ResumenNotificaciones";
import "../dashboard.css";

export const DashboardPagina: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const fechaHoy = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const fechaFormateada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

  const modulosSistema = [
    {
      titulo: "Gestión de Tareas",
      descripcion: "Organiza tus actividades pendientes y fechas límite.",
      ruta: "/tareas",
      accion: "Ir a Tareas",
    },
    {
      titulo: "Metas y Objetivos",
      descripcion: "Define metas personales y su fecha de cumplimiento.",
      ruta: "/metas",
      accion: "Ir a Metas",
    },
    {
      titulo: "Notificaciones",
      descripcion: "Avisos automáticos cuando una meta está por vencer.",
      ruta: "/notificaciones",
      accion: "Ir a Notificaciones",
    },
    {
      titulo: "Perfil y Ajustes",
      descripcion: "Administra tu cuenta, correo y contraseña.",
      ruta: "/perfil",
      accion: "Ir a Mi Perfil",
    },
  ];

  return (
    <div className="dashboard-contenedor">
      <header className="dashboard-header">
        <div className="dashboard-header-izq">
          <h1 className="dashboard-titulo">
            Panel de Control — {usuario?.nombre || "Usuario"}
          </h1>
          <p className="dashboard-descripcion">
            Supervisión general de tus tareas, metas y avisos
          </p>
        </div>
        <div className="dashboard-fecha-actual">
          {fechaFormateada}
        </div>
      </header>

      <section className="dashboard-grid-metricas" aria-label="Resumen de módulos">
        <ResumenTareas />
        <ResumenMetas />
        <ResumenNotificaciones />
      </section>

      <section className="dashboard-seccion-modulos">
        <h2 className="dashboard-seccion-titulo">Módulos del Sistema</h2>

        <div className="dashboard-grid-accesos">
          {modulosSistema.map((mod) => (
            <article key={mod.ruta} className="tarjeta-acceso-modulo">
              <div>
                <h3 className="tarjeta-acceso-titulo">{mod.titulo}</h3>
                <p className="tarjeta-acceso-desc">{mod.descripcion}</p>
              </div>
              <button
                type="button"
                className="btn-secundario btn-acceso-modulo"
                onClick={() => navigate(mod.ruta)}
              >
                {mod.accion}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
