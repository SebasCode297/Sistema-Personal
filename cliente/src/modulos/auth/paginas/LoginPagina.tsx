import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../auth.css";

export const LoginPagina: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <div className="auth-tarjeta">
        <header className="auth-header">
          <h1 className="auth-titulo">Iniciar Sesión</h1>
          <p className="auth-subtitulo">Ingresa a tu panel de control personal</p>
        </header>

        {error && (
          <div className="alerta alerta-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-formulario">
          <div className="campo-grupo">
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              type="email"
              className="campo-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
              autoComplete="email"
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="campo-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primario auth-btn-submit"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              "Ingresar a MiPanel"
            )}
          </button>
        </form>

        <footer className="auth-footer">
          ¿No tienes una cuenta?
          <Link to="/registro">Regístrate aquí</Link>
        </footer>
      </div>
    </div>
  );
};
