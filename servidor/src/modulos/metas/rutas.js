const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const {
  listarMetas,
  crearMeta,
  actualizarMeta,
  eliminarMeta,
  resumenMetas,
} = require("./controlador");

const router = express.Router();

router.use(autenticarToken);

router.get("/resumen", resumenMetas);
router.get("/", listarMetas);
router.post("/", crearMeta);
router.put("/:id", actualizarMeta);
router.delete("/:id", eliminarMeta);

module.exports = router;
