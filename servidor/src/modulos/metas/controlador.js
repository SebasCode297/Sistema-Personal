const { pool } = require("../../db");
const { generarAvisosDeMetas } = require("../notificaciones/avisosMetas");

function validarMeta(body) {
  const { titulo, descripcion, fecha_fin } = body;

  if (!titulo || typeof titulo !== "string" || titulo.trim().length < 2) {
    return "El título es obligatorio y debe tener al menos 2 caracteres.";
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== "string") {
    return "La descripción no es válida.";
  }

  if (fecha_fin !== undefined && fecha_fin !== null && fecha_fin !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin)) {
      return "La fecha límite debe tener el formato YYYY-MM-DD.";
    }
  }

  return null;
}

async function listarMetas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, titulo, descripcion, fecha_fin, creado_en, actualizado_en
       FROM metas
       WHERE usuario_id = $1
       ORDER BY fecha_fin ASC NULLS LAST, creado_en DESC`,
      [req.usuario.id]
    );
    res.json({ ok: true, metas: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener metas.", error: error.message });
  }
}

async function crearMeta(req, res) {
  try {
    const error = validarMeta(req.body);
    if (error) return res.status(400).json({ ok: false, mensaje: error });

    const { titulo, descripcion, fecha_fin } = req.body;

    const resultado = await pool.query(
      `INSERT INTO metas (usuario_id, titulo, descripcion, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, titulo, descripcion, fecha_fin, creado_en, actualizado_en`,
      [req.usuario.id, titulo.trim(), descripcion?.trim() || null, fecha_fin || null]
    );

    await generarAvisosDeMetas(req.usuario.id);

    res.status(201).json({ ok: true, mensaje: "Meta creada.", meta: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear la meta.", error: error.message });
  }
}

async function actualizarMeta(req, res) {
  try {
    const { id } = req.params;
    const error = validarMeta(req.body);
    if (error) return res.status(400).json({ ok: false, mensaje: error });

    const existente = await pool.query(
      "SELECT id FROM metas WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );
    if (existente.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Meta no encontrada." });
    }

    const { titulo, descripcion, fecha_fin } = req.body;

    const resultado = await pool.query(
      `UPDATE metas
       SET titulo = $1,
           descripcion = $2,
           fecha_fin = $3,
           actualizado_en = NOW()
       WHERE id = $4 AND usuario_id = $5
       RETURNING id, titulo, descripcion, fecha_fin, creado_en, actualizado_en`,
      [titulo.trim(), descripcion?.trim() || null, fecha_fin || null, id, req.usuario.id]
    );

    await generarAvisosDeMetas(req.usuario.id);

    res.json({ ok: true, mensaje: "Meta actualizada.", meta: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar la meta.", error: error.message });
  }
}

async function eliminarMeta(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM metas WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Meta no encontrada." });
    }
    res.json({ ok: true, mensaje: "Meta eliminada." });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar la meta.", error: error.message });
  }
}

async function resumenMetas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT COUNT(*) AS total
       FROM metas
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ ok: true, resumen: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al calcular el resumen de metas.", error: error.message });
  }
}

module.exports = { listarMetas, crearMeta, actualizarMeta, eliminarMeta, resumenMetas };
