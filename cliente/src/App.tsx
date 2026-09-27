import { useState } from "react";
import "./App.css";

type RespuestaSalud = {
  ok: boolean;
  servicio?: string;
  fase?: number;
  baseDatos?: {
    estado: string;
    nombre?: string;
    hora?: string;
    mensaje?: string;
  };
};

const urlApi = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function App() {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<RespuestaSalud | null>(null);
  const [errorRed, setErrorRed] = useState("");

  async function comprobarConexion() {
    setCargando(true);
    setErrorRed("");
    setResultado(null);

    try {
      const respuesta = await fetch(`${urlApi}/api/salud`);
      const datos = (await respuesta.json()) as RespuestaSalud;
      setResultado(datos);
    } catch {
      setErrorRed("No se pudo contactar con el servidor. ¿Está en marcha en el puerto 4000?");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pantalla">
      <section className="contenido">
        <h1 className="titulo">MiPanel</h1>
        <p className="subtitulo">Fase 1 — Configuración del entorno</p>

        <article className="tarjeta">
          <p>Esta pantalla solo comprueba que el cliente React, la API y PostgreSQL se comunican.</p>
          <button type="button" onClick={comprobarConexion} disabled={cargando}>
            {cargando ? "Comprobando…" : "Comprobar API y base de datos"}
          </button>

          {errorRed ? <p className="estado error">{errorRed}</p> : null}

          {resultado ? (
            <div className="estado">
              <p className={resultado.ok ? "ok" : "error"}>
                {resultado.ok ? "Conexión correcta" : "El servidor respondió con error"}
              </p>
              <p className="detalle">Servicio: {resultado.servicio ?? "desconocido"}</p>
              <p className="detalle">PostgreSQL: {resultado.baseDatos?.estado ?? "sin datos"}</p>
              {resultado.baseDatos?.nombre ? (
                <p className="detalle">Base: {resultado.baseDatos.nombre}</p>
              ) : null}
              {resultado.baseDatos?.mensaje ? (
                <p className="detalle">{resultado.baseDatos.mensaje}</p>
              ) : null}
            </div>
          ) : null}

          <ul className="lista">
            <li>Cliente: React + TypeScript + Vite</li>
            <li>API: {urlApi}</li>
            <li>Siguiente paso: autenticación (Fase 2)</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

export default App;
