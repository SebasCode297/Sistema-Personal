const { pool } = require("../../db");

/**
 * Obtener notificaciones del usuario autenticado
 */
async function obtenerNotificaciones(req, res) {
  const usuarioId = req.usuario.id;
  const { soloNoLeidas } = req.query;

  try {
    let consulta = "SELECT * FROM notificaciones WHERE usuario_id = $1";
    const valores = [usuarioId];

    if (soloNoLeidas === "true") {
      consulta += " AND leida = false";
    }

    consulta += " ORDER BY creado_en DESC LIMIT 50";

    const resultado = await pool.query(consulta, valores);
    res.json({ ok: true, datos: resultado.rows });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al obtener notificaciones" });
  }
}

/**
 * Obtener conteo de notificaciones no leídas y resumen
 */
async function obtenerResumen(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const consulta = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE leida = false) AS no_leidas
      FROM notificaciones
      WHERE usuario_id = $1
    `;
    const resultado = await pool.query(consulta, [usuarioId]);
    const resumen = resultado.rows[0] || { total: 0, no_leidas: 0 };

    res.json({
      ok: true,
      datos: {
        total: parseInt(resumen.total, 10) || 0,
        no_leidas: parseInt(resumen.no_leidas, 10) || 0,
      },
    });
  } catch (error) {
    console.error("Error al obtener resumen de notificaciones:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al obtener resumen" });
  }
}

/**
 * Crear una nueva notificación
 */
async function crearNotificacion(req, res) {
  const usuarioId = req.usuario.id;
  const { titulo, mensaje, tipo, enlace } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El título es obligatorio" });
  }

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El mensaje es obligatorio" });
  }

  try {
    const consulta = `
      INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, enlace)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const valores = [
      usuarioId,
      titulo.trim(),
      mensaje.trim(),
      tipo || "info",
      enlace ? enlace.trim() : null,
    ];

    const resultado = await pool.query(consulta, valores);
    res.status(201).json({ ok: true, datos: resultado.rows[0] });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al crear notificación" });
  }
}

/**
 * Marcar una notificación específica como leída
 */
async function marcarLeida(req, res) {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const consulta = `
      UPDATE notificaciones 
      SET leida = true 
      WHERE id = $1 AND usuario_id = $2 
      RETURNING *
    `;
    const resultado = await pool.query(consulta, [id, usuarioId]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Notificación no encontrada" });
    }

    res.json({ ok: true, datos: resultado.rows[0] });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al marcar notificación" });
  }
}

/**
 * Marcar todas las notificaciones del usuario como leídas
 */
async function marcarTodasLeidas(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const consulta = "UPDATE notificaciones SET leida = true WHERE usuario_id = $1";
    await pool.query(consulta, [usuarioId]);

    res.json({ ok: true, mensaje: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar todas las notificaciones:", error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar notificaciones" });
  }
}

/**
 * Eliminar una notificación
 */
async function eliminarNotificacion(req, res) {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const consulta = "DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2 RETURNING id";
    const resultado = await pool.query(consulta, [id, usuarioId]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Notificación no encontrada" });
    }

    res.json({ ok: true, mensaje: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ ok: false, mensaje: "Error al eliminar notificación" });
  }
}

/**
 * Limpiar todas las notificaciones ya leídas
 */
async function limpiarLeidas(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const consulta = "DELETE FROM notificaciones WHERE usuario_id = $1 AND leida = true";
    await pool.query(consulta, [usuarioId]);

    res.json({ ok: true, mensaje: "Notificaciones leídas eliminadas" });
  } catch (error) {
    console.error("Error al limpiar notificaciones leídas:", error);
    res.status(500).json({ ok: false, mensaje: "Error al limpiar notificaciones" });
  }
}

module.exports = {
  obtenerNotificaciones,
  obtenerResumen,
  crearNotificacion,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  limpiarLeidas,
};
