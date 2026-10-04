const bcrypt = require("bcryptjs");
const { pool } = require("../../db");

/**
 * Obtener los datos del perfil del usuario autenticado
 */
async function obtenerPerfil(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const consulta = `
      SELECT id, nombre, email, creado_en 
      FROM usuarios 
      WHERE id = $1
    `;
    const resultado = await pool.query(consulta, [usuarioId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    res.json({ ok: true, datos: resultado.rows[0] });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al obtener el perfil" });
  }
}

/**
 * Actualizar datos básicos (nombre, email)
 */
async function actualizarPerfil(req, res) {
  const usuarioId = req.usuario.id;
  const { nombre, email } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El nombre es obligatorio" });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El email es obligatorio" });
  }

  try {
    // Verificar si el nuevo email ya está en uso por otro usuario
    const emailExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1 AND id != $2",
      [email.toLowerCase().trim(), usuarioId]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ ok: false, mensaje: "Ese correo electrónico ya está registrado por otra cuenta" });
    }

    const consulta = `
      UPDATE usuarios
      SET 
        nombre = $1,
        email = $2,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, nombre, email, creado_en
    `;

    const resultado = await pool.query(consulta, [
      nombre.trim(),
      email.toLowerCase().trim(),
      usuarioId,
    ]);

    res.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente",
      datos: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al actualizar el perfil" });
  }
}

/**
 * Cambiar contraseña del usuario autenticado
 */
async function cambiarPassword(req, res) {
  const usuarioId = req.usuario.id;
  const { password_actual, password_nueva } = req.body;

  if (!password_actual || !password_nueva) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debes ingresar tu contraseña actual y la nueva contraseña",
    });
  }

  if (password_nueva.length < 6) {
    return res.status(400).json({
      ok: false,
      mensaje: "La nueva contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    const consultaUsuario = "SELECT password_hash FROM usuarios WHERE id = $1";
    const resultado = await pool.query(consultaUsuario, [usuarioId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(
      password_actual,
      resultado.rows[0].password_hash
    );

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: "La contraseña actual es incorrecta",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const nuevoHash = await bcrypt.hash(password_nueva, salt);

    await pool.query(
      "UPDATE usuarios SET password_hash = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2",
      [nuevoHash, usuarioId]
    );

    res.json({ ok: true, mensaje: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al cambiar contraseña" });
  }
}

/**
 * Eliminar la cuenta personal de forma irreversible
 */
async function eliminarCuenta(req, res) {
  const usuarioId = req.usuario.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debes confirmar tu contraseña para eliminar la cuenta",
    });
  }

  try {
    const consultaUsuario = "SELECT password_hash FROM usuarios WHERE id = $1";
    const resultado = await pool.query(consultaUsuario, [usuarioId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(password, resultado.rows[0].password_hash);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: "Contraseña incorrecta" });
    }

    // Al eliminar el usuario, la cascada (ON DELETE CASCADE) elimina todas sus finanzas, tareas, metas, eventos y notificaciones
    await pool.query("DELETE FROM usuarios WHERE id = $1", [usuarioId]);

    res.json({ ok: true, mensaje: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al eliminar la cuenta" });
  }
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  eliminarCuenta,
};
