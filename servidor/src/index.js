require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { verificarConexion } = require("./db");

const rutasAuth = require("./modulos/auth/rutas");
const rutasTareas = require("./modulos/tareas/rutas");
const rutasMetas = require("./modulos/metas/rutas");
const rutasNotificaciones = require("./modulos/notificaciones/rutas");
const rutasPerfil = require("./modulos/perfil/rutas");

const app = express();
const puerto = Number(process.env.PORT || 4000);
const origenCliente = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: origenCliente,
  })
);
app.use(express.json());

app.use("/api/auth", rutasAuth);
app.use("/api/tareas", rutasTareas);
app.use("/api/metas", rutasMetas);
app.use("/api/notificaciones", rutasNotificaciones);
app.use("/api/perfil", rutasPerfil);

app.get("/api/salud", async (_req, res) => {
  try {
    const datosBd = await verificarConexion();

    res.json({
      ok: true,
      servicio: "MiPanel API",
      baseDatos: {
        estado: "conectada",
        nombre: datosBd.base_datos,
        hora: datosBd.ahora,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      servicio: "MiPanel API",
      baseDatos: {
        estado: "error",
        mensaje: error.message,
      },
    });
  }
});

app.listen(puerto, () => {
  console.log(`Servidor MiPanel escuchando en http://localhost:${puerto}`);
  console.log(`Origen CORS permitido: ${origenCliente}`);
});
