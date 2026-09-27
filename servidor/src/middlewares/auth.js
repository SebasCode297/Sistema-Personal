const jwt = require("jsonwebtoken");

/**
 * Middleware para verificar el token JWT y proteger rutas privadas.
 * Extrae el usuario del token y lo asigna a req.usuario.
 */
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Acceso denegado: no se proporcionó un token de autenticación.",
    });
  }

  const secreto = process.env.JWT_SECRET || "mipanel_secreto_super_seguro_jwt_2026_personal";

  try {
    const usuarioDecodificado = jwt.verify(token, secreto);
    req.usuario = usuarioDecodificado;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: "Sesión inválida o expirada. Por favor, inicia sesión nuevamente.",
      error: error.message,
    });
  }
}

module.exports = {
  autenticarToken,
};
