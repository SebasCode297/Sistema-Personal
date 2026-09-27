import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../auth.css";

export const RegistroPagina: React.FC = () => {
  const { registro } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !email.trim() || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await registro({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <div className="auth-tarjeta">
        <header className="auth-header">
          <h1 className="auth-titulo">Crear Cuenta</h1>
          <p className="auth-subtitulo">Comienza a organizar tu vida con MiPanel</p>
        </header>

        {error && (
          <div className="alerta alerta-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-formulario">
          <div className="campo-grupo">
            <label htmlFor="reg-nombre">Nombre Completo</label>
            <input
              id="reg-nombre"
              type="text"
              className="campo-input"
              placeholder="Ej. Carlos Mendoza"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={cargando}
              autoComplete="name"
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <input
              id="reg-email"
              type="email"
              className="campo-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
              autoComplete="email"
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
            <input
              id="reg-password"
              type="password"
              className="campo-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="reg-confirm-password">Confirmar Contraseña</label>
            <input
              id="reg-confirm-password"
              type="password"
              className="campo-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={cargando}
              autoComplete="new-password"
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
                <span>Creando cuenta...</span>
              </>
            ) : (
              "Registrarse en MiPanel"
            )}
          </button>
        </form>

        <footer className="auth-footer">
          ¿Ya tienes una cuenta?
          <Link to="/login">Inicia sesión aquí</Link>
        </footer>
      </div>
    </div>
  );
};
