import React from "react";
import { useAuth } from "../context/AuthContext";

export const DashboardInicio: React.FC = () => {
  const { usuario } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Banner de Bienvenida */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "var(--radio-lg)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            alignSelf: "flex-start",
            background: "rgba(16, 185, 129, 0.2)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.82rem",
            fontWeight: 700,
          }}
        >
          ✓ FASE 2: AUTENTICACIÓN COMPLETADA
        </span>
        <h1 style={{ fontSize: "1.9rem" }}>
          ¡Bienvenido de nuevo, {usuario?.nombre}! 👋
        </h1>
        <p style={{ maxWidth: "680px", color: "var(--texto-secundario)", fontSize: "1rem" }}>
          Has iniciado sesión correctamente en <strong>MiPanel</strong>. Tu sesión está
          protegida mediante JWT, con contraseñas encriptadas en PostgreSQL y rutas protegidas en React.
        </p>
      </section>

      {/* Tarjetas de Información del Sistema */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            background: "var(--bg-tarjeta)",
            border: "1px solid var(--borde-suave)",
            borderRadius: "var(--radio-md)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>👤</span>
          <h3 style={{ fontSize: "1.1rem" }}>Datos del Usuario</h3>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>Nombre:</strong> {usuario?.nombre}
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>Email:</strong> {usuario?.email}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--texto-muted)" }}>
            ID Usuario en BD: #{usuario?.id}
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-tarjeta)",
            border: "1px solid var(--borde-suave)",
            borderRadius: "var(--radio-md)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>🔒</span>
          <h3 style={{ fontSize: "1.1rem" }}>Seguridad y Sesión</h3>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>Autenticación:</strong> JSON Web Token (JWT)
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>Hash de contraseña:</strong> bcryptjs (Salt rounds: 10)
          </p>
          <p style={{ fontSize: "0.85rem", color: "#10b981" }}>
            ✓ Rutas del cliente protegidas con guard
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-tarjeta)",
            border: "1px solid var(--borde-suave)",
            borderRadius: "var(--radio-md)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>🚀</span>
          <h3 style={{ fontSize: "1.1rem" }}>Siguiente Fase</h3>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>Fase 3: Dashboard</strong>
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--texto-secundario)" }}>
            Construcción de la interfaz central del Dashboard con métricas y resúmenes de módulos.
          </p>
        </div>
      </div>
    </div>
  );
};
