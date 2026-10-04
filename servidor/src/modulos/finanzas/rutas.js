const express = require("express");
const { autenticarToken } = require("../../middlewares/auth");
const { listarCategorias, crearCategoria, eliminarCategoria } = require("./categoriasControlador");
const { listarIngresos, crearIngreso, actualizarIngreso, eliminarIngreso, resumenIngresos } = require("./ingresosControlador");
const { listarGastos, crearGasto, actualizarGasto, eliminarGasto, resumenGastos, gastosPorCategoria } = require("./gastosControlador");
const { evolucionMensual } = require("./estadisticasControlador");

const router = express.Router();

// Todas las rutas del módulo Finanzas requieren autenticación
router.use(autenticarToken);

// Categorías
router.get("/categorias", listarCategorias);
router.post("/categorias", crearCategoria);
router.delete("/categorias/:id", eliminarCategoria);

// Ingresos
router.get("/ingresos/resumen", resumenIngresos);
router.get("/ingresos", listarIngresos);
router.post("/ingresos", crearIngreso);
router.put("/ingresos/:id", actualizarIngreso);
router.delete("/ingresos/:id", eliminarIngreso);

// Gastos
router.get("/gastos/resumen", resumenGastos);
router.get("/gastos/por-categoria", gastosPorCategoria);
router.get("/evolucion-mensual", evolucionMensual);
router.get("/gastos", listarGastos);
router.post("/gastos", crearGasto);
router.put("/gastos/:id", actualizarGasto);
router.delete("/gastos/:id", eliminarGasto);

module.exports = router;
