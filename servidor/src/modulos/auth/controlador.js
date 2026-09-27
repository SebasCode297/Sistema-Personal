const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../../db");

const JWT_SECRET = process.env.JWT_SECRET || "mipanel_secreto_super_seguro_jwt_2026_personal";
const JWT_EXPIRA = process.env.JWT_EXPIRA || "7d";

/**
 * Validador básico de email
 */
function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Registro de un nuevo usuario
 * POST /api/auth/register
 */
async function registrarUsuario(req, res) {
  try {
    const { nombre, email, password } = req.body;

    // 1. Validaciones
    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre es obligatorio y debe tener al menos 2 caracteres.",
      });
    }

    if (!email || !esEmailValido(email.trim())) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes proporcionar un correo electrónico válido.",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const emailLimpio = email.trim().toLowerCase();
    const nombreLimpio = nombre.trim();

    // 2. Verificar si el email ya existe
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailLimpio]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El correo electrónico ya está registrado.",
      });
    }

    // 3. Hashear la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Insertar en la base de datos
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, creado_en`,
      [nombreLimpio, emailLimpio, passwordHash]
    );

    const usuario = nuevoUsuario.rows[0];

    // 5. Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRA }
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Usuario registrado con éxito.",
      usuario,
      token,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al registrar el usuario.",
      error: error.message,
    });
  }
}

/**
 * Inicio de sesión
 * POST /api/auth/login
 */
async function iniciarSesion(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes ingresar tu correo electrónico y tu contraseña.",
      });
    }

    const emailLimpio = email.trim().toLowerCase();

    // 1. Buscar usuario por email
    const resultado = await pool.query(
      "SELECT id, nombre, email, password_hash, creado_en FROM usuarios WHERE email = $1",
      [emailLimpio]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    const usuario = resultado.rows[0];

    // 2. Comparar contraseñas
    const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecto) {
      return res.status(401).json({
        ok: false,
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    // 3. Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRA }
    );

    return res.json({
      ok: true,
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        creado_en: usuario.creado_en,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al iniciar sesión.",
      error: error.message,
    });
  }
}

/**
 * Obtener datos del usuario autenticado actual
 * GET /api/auth/me
 */
async function obtenerUsuarioActual(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      "SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1",
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al consultar los datos del usuario.",
      error: error.message,
    });
  }
}

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerUsuarioActual,
};
