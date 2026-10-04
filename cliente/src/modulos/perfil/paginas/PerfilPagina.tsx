import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  perfilServicio,
  type UsuarioPerfil,
} from "../servicios/perfilServicio";
import "../perfil.css";

export const PerfilPagina: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [cargando, setCargando] = useState(true);

  // Formulario Datos
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [mensajeDatos, setMensajeDatos] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Formulario Password
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [mensajePass, setMensajePass] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Formulario Eliminar Cuenta
  const [passEliminar, setPassEliminar] = useState("");
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [mensajeEliminar, setMensajeEliminar] = useState<string | null>(null);

  async function cargarPerfil() {
    try {
      setCargando(true);
      const datos = await perfilServicio.obtenerPerfil();
      setPerfil(datos);
      setNombre(datos.nombre);
      setEmail(datos.email);
    } catch {
      if (usuario) {
        setNombre(usuario.nombre || "");
        setEmail(usuario.email || "");
      }
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function handleActualizarDatos(e: React.FormEvent) {
    e.preventDefault();
    setMensajeDatos(null);

    if (!nombre.trim() || !email.trim()) {
      setMensajeDatos({ tipo: "error", texto: "El nombre y el correo son obligatorios." });
      return;
    }

    try {
      setGuardandoDatos(true);
      const actualizado = await perfilServicio.actualizarPerfil({
        nombre: nombre.trim(),
        email: email.trim(),
      });
      setPerfil(actualizado);
      setMensajeDatos({ tipo: "exito", texto: "Tus datos personales fueron actualizados correctamente." });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al actualizar datos";
      setMensajeDatos({ tipo: "error", texto: msj });
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setMensajePass(null);

    if (!passActual || !passNueva) {
      setMensajePass({ tipo: "error", texto: "Completa los campos de contraseña." });
      return;
    }

    if (passNueva.length < 6) {
      setMensajePass({ tipo: "error", texto: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }

    if (passNueva !== passConfirmar) {
      setMensajePass({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
      return;
    }

    try {
      setGuardandoPass(true);
      const msj = await perfilServicio.cambiarPassword({
        password_actual: passActual,
        password_nueva: passNueva,
      });
      setMensajePass({ tipo: "exito", texto: msj });
      setPassActual("");
      setPassNueva("");
      setPassConfirmar("");
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al cambiar contraseña";
      setMensajePass({ tipo: "error", texto: msj });
    } finally {
      setGuardandoPass(false);
    }
  }

  async function handleEliminarCuenta(e: React.FormEvent) {
    e.preventDefault();
    setMensajeEliminar(null);

    if (!passEliminar) {
      setMensajeEliminar("Debes ingresar tu contraseña para confirmar.");
      return;
    }

    const seguro = window.confirm(
      "ADVERTENCIA CRÍTICA: ¿Estás totalmente seguro de eliminar tu cuenta? Esta acción eliminará permanentemente todas tus finanzas, tareas, metas, eventos y avisos de manera irreversible."
    );
    if (!seguro) return;

    try {
      setEliminandoCuenta(true);
      await perfilServicio.eliminarCuenta(passEliminar);
      logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error al eliminar la cuenta";
      setMensajeEliminar(msj);
      setEliminandoCuenta(false);
    }
  }

  const inicial = (perfil?.nombre || usuario?.nombre || "U").charAt(0).toUpperCase();

  function formatearFechaRegistro(fechaIso?: string): string {
    if (!fechaIso) return "Miembro de MiPanel";
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return "Miembro de MiPanel";
    return `Cuenta creada el ${d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  }

  if (cargando) {
    return (
      <div className="perfil-pagina">
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-pagina">
      <header className="perfil-header">
        <h1>Perfil y Ajustes</h1>
        <p>Administra tu información personal, seguridad de acceso y preferencias de tu panel</p>
      </header>

      {/* Tarjeta Resumen */}
      <section className="perfil-card-resumen">
        <div className="perfil-avatar-grande">{inicial}</div>
        <div className="perfil-info-resumen">
          <h2>{perfil?.nombre || usuario?.nombre || "Usuario"}</h2>
          <p>{perfil?.email || usuario?.email || ""}</p>
          <span className="perfil-badge-antiguedad">
            {formatearFechaRegistro(perfil?.creado_en)}
          </span>
        </div>
      </section>

      {/* Formulario Datos Personales */}
      <section className="perfil-seccion">
        <h2 className="perfil-seccion-titulo">Datos de la Cuenta</h2>
        <p className="perfil-seccion-subtitulo">
          Actualiza tu nombre visible y dirección de correo electrónico
        </p>

        {mensajeDatos && (
          <div className={mensajeDatos.tipo === "exito" ? "alerta-exito" : "alerta-error"}>
            {mensajeDatos.texto}
          </div>
        )}

        <form onSubmit={handleActualizarDatos} className="perfil-form">
          <div className="form-grupo">
            <label htmlFor="perfil-nombre">Nombre Completo *</label>
            <input
              id="perfil-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="perfil-email">Correo Electrónico *</label>
            <input
              id="perfil-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="perfil-form-acciones">
            <button
              type="submit"
              className="btn-guardar-perfil"
              disabled={guardandoDatos}
            >
              {guardandoDatos ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </section>

      {/* Formulario Seguridad / Contraseña */}
      <section className="perfil-seccion">
        <h2 className="perfil-seccion-titulo">Seguridad y Contraseña</h2>
        <p className="perfil-seccion-subtitulo">
          Modifica tu contraseña de acceso para proteger tu información personal
        </p>

        {mensajePass && (
          <div className={mensajePass.tipo === "exito" ? "alerta-exito" : "alerta-error"}>
            {mensajePass.texto}
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="perfil-form">
          <div className="form-grupo">
            <label htmlFor="pass-actual">Contraseña Actual *</label>
            <input
              id="pass-actual"
              type="password"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="pass-nueva">Nueva Contraseña *</label>
            <input
              id="pass-nueva"
              type="password"
              value={passNueva}
              onChange={(e) => setPassNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="pass-confirmar">Confirmar Nueva Contraseña *</label>
            <input
              id="pass-confirmar"
              type="password"
              value={passConfirmar}
              onChange={(e) => setPassConfirmar(e.target.value)}
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          <div className="perfil-form-acciones">
            <button
              type="submit"
              className="btn-guardar-perfil"
              disabled={guardandoPass}
            >
              {guardandoPass ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </section>

      {/* Zona de Peligro */}
      <section className="perfil-seccion peligro">
        <h2 className="perfil-seccion-titulo">Zona de Peligro</h2>
        <p className="perfil-seccion-subtitulo">
          Eliminación permanente e irreversible de tu cuenta y todos sus registros
        </p>

        <div className="advertencia-peligro-txt">
          Atención: Si eliminas tu cuenta, se borrarán todos tus ingresos, gastos, tareas, metas, eventos y avisos almacenados en la base de datos de manera definitiva.
        </div>

        {mensajeEliminar && <div className="alerta-error">{mensajeEliminar}</div>}

        <form onSubmit={handleEliminarCuenta} className="perfil-form">
          <div className="form-grupo">
            <label htmlFor="pass-eliminar">Confirma tu Contraseña para Eliminar</label>
            <input
              id="pass-eliminar"
              type="password"
              value={passEliminar}
              onChange={(e) => setPassEliminar(e.target.value)}
              placeholder="Tu contraseña actual"
              required
            />
          </div>

          <div className="perfil-form-acciones">
            <button
              type="submit"
              className="btn-eliminar-cuenta"
              disabled={eliminandoCuenta}
            >
              {eliminandoCuenta ? "Eliminando cuenta..." : "Eliminar mi cuenta definitivamente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
