const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const {
  obtenerNotificaciones,
  obtenerResumen,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  limpiarLeidas,
} = require("./controlador");

const router = express.Router();

router.use(autenticarToken);

router.get("/", obtenerNotificaciones);
router.get("/resumen", obtenerResumen);
router.put("/marcar-todas", marcarTodasLeidas);
router.put("/:id/leida", marcarLeida);
router.delete("/limpiar-leidas", limpiarLeidas);
router.delete("/:id", eliminarNotificacion);

module.exports = router;
