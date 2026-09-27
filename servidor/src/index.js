require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { verificarConexion } = require("./db");

const app = express();
const puerto = Number(process.env.PORT || 4000);
const origenCliente = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: origenCliente,
  })
);
app.use(express.json());

app.get("/api/salud", async (_req, res) => {
  try {
    const datosBd = await verificarConexion();

    res.json({
      ok: true,
      servicio: "MiPanel API",
      fase: 1,
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
      fase: 1,
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
