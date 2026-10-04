import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export const Layout: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function cerrarMenu() {
    setMenuMovilAbierto(false);
  }

  const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U";

  return (
    <div className="layout-contenedor">
      {/* Overlay para móvil cuando el menú está abierto */}
      {menuMovilAbierto && (
        <div className="layout-overlay" onClick={cerrarMenu} />
      )}

      {/* Barra superior visible solo en pantallas pequeñas */}
      <header className="layout-topbar-movil">
        <span className="layout-topbar-brand">MiPanel</span>
        <button
          type="button"
          className="btn-menu-hamburguesa"
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          aria-label="Alternar menú"
        >
          <span className="icono-linea"></span>
          <span className="icono-linea"></span>
          <span className="icono-linea"></span>
        </button>
      </header>

      {/* Sidebar de navegación */}
      <aside className={`layout-sidebar ${menuMovilAbierto ? "abierto" : ""}`}>
        <div className="layout-brand">
          <div className="layout-logo">MP</div>
          <span className="layout-brand-nombre">MiPanel</span>
        </div>

        <nav className="layout-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/finanzas"
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Finanzas</span>
          </NavLink>

          <NavLink
            to="/tareas"
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Tareas</span>
          </NavLink>

          <NavLink
            to="/metas"
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Metas</span>
          </NavLink>

          <NavLink
            to="/calendario"
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Calendario</span>
          </NavLink>

          <NavLink
            to="/notificaciones"
            className={({ isActive }) => `nav-item ${isActive ? "activo" : ""}`}
            onClick={cerrarMenu}
          >
            <span>Notificaciones</span>
          </NavLink>

          <div className="nav-item deshabilitado">
            <span>Perfil</span>
            <span className="nav-badge-proximo">Fase 9</span>
          </div>
        </nav>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className="layout-sidebar-footer">
          <div className="usuario-info">
            <div className="usuario-avatar">{inicial}</div>
            <div className="usuario-detalles">
              <span className="usuario-nombre">{usuario?.nombre || "Usuario"}</span>
              <span className="usuario-email">{usuario?.email || ""}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-secundario btn-logout"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de contenido principal */}
      <main className="layout-principal">
        <div className="layout-contenido">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
