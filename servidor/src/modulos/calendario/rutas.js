const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const {
  obtenerEventos,
  obtenerProximosEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} = require("./controlador");

const router = express.Router();

// Todas las rutas de calendario requieren autenticación JWT
router.use(autenticarToken);

router.get("/", obtenerEventos);
router.get("/proximos", obtenerProximosEventos);
router.post("/", crearEvento);
router.put("/:id", actualizarEvento);
router.delete("/:id", eliminarEvento);

module.exports = router;
