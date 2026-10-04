const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const {
  listarTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
  resumenTareas,
} = require("./controlador");

const router = express.Router();

router.use(autenticarToken);

router.get("/resumen", resumenTareas);
router.get("/", listarTareas);
router.post("/", crearTarea);
router.put("/:id", actualizarTarea);
router.delete("/:id", eliminarTarea);

module.exports = router;
