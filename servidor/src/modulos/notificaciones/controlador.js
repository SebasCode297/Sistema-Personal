const { pool } = require("../../db");
const { generarAvisosDeMetas } = require("./avisosMetas");

async function obtenerNotificaciones(req, res) {
  const usuarioId = req.usuario.id;
  const { soloNoLeidas } = req.query;

  try {
    await generarAvisosDeMetas(usuarioId);

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

async function obtenerResumen(req, res) {
  const usuarioId = req.usuario.id;

  try {
    await generarAvisosDeMetas(usuarioId);

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

async function marcarTodasLeidas(req, res) {
  const usuarioId = req.usuario.id;

  try {
    await pool.query("UPDATE notificaciones SET leida = true WHERE usuario_id = $1", [usuarioId]);
    res.json({ ok: true, mensaje: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar todas las notificaciones:", error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar notificaciones" });
  }
}

async function eliminarNotificacion(req, res) {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      "DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, usuarioId]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Notificación no encontrada" });
    }

    res.json({ ok: true, mensaje: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ ok: false, mensaje: "Error al eliminar notificación" });
  }
}

async function limpiarLeidas(req, res) {
  const usuarioId = req.usuario.id;

  try {
    await pool.query("DELETE FROM notificaciones WHERE usuario_id = $1 AND leida = true", [usuarioId]);
    res.json({ ok: true, mensaje: "Notificaciones leídas eliminadas" });
  } catch (error) {
    console.error("Error al limpiar notificaciones leídas:", error);
    res.status(500).json({ ok: false, mensaje: "Error al limpiar notificaciones" });
  }
}

module.exports = {
  obtenerNotificaciones,
  obtenerResumen,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  limpiarLeidas,
};
