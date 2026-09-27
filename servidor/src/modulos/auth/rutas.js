const express = require("express");
const { registrarUsuario, iniciarSesion, obtenerUsuarioActual } = require("./controlador");
const { autenticarToken } = require("../../middlewares/auth");

const router = express.Router();

// Rutas públicas
router.post("/register", registrarUsuario);
router.post("/login", iniciarSesion);

// Rutas protegidas
router.get("/me", autenticarToken, obtenerUsuarioActual);

module.exports = router;
