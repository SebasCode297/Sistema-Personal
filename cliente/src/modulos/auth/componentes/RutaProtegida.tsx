import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export const RutaProtegida: React.FC = () => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: "1rem"
      }}>
        <div className="spinner" style={{ width: "36px", height: "36px" }}></div>
        <p style={{ color: "var(--texto-secundario)", fontSize: "0.95rem" }}>
          Verificando sesión segura...
        </p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
