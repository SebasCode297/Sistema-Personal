const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  eliminarCuenta,
} = require("./controlador");

const router = express.Router();

router.use(autenticarToken);

router.get("/", obtenerPerfil);
router.put("/", actualizarPerfil);
router.put("/cambiar-password", cambiarPassword);
router.delete("/eliminar-cuenta", eliminarCuenta);

module.exports = router;
