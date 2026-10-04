const { pool } = require("../../db");

/**
 * GET /api/finanzas/ingresos
 * Acepta query params: ?mes=YYYY-MM para filtrar por mes
 */
async function listarIngresos(req, res) {
  try {
    const { mes } = req.query;
    let query = `
      SELECT i.id, i.monto, i.descripcion, i.fecha,
             c.nombre AS categoria_nombre, c.id AS categoria_id,
             i.creado_en
      FROM ingresos i
      LEFT JOIN categorias_finanzas c ON c.id = i.categoria_id
      WHERE i.usuario_id = $1
    `;
    const params = [req.usuario.id];

    if (mes) {
      query += ` AND TO_CHAR(i.fecha, 'YYYY-MM') = $2`;
      params.push(mes);
    }

    query += " ORDER BY i.fecha DESC, i.creado_en DESC";

    const resultado = await pool.query(query, params);
    res.json({ ok: true, ingresos: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener ingresos.", error: error.message });
  }
}

/**
 * POST /api/finanzas/ingresos
 */
async function crearIngreso(req, res) {
  try {
    const { monto, descripcion, categoria_id, fecha } = req.body;

    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      return res.status(400).json({ ok: false, mensaje: "El monto debe ser un número mayor a 0." });
    }

    const fechaValida = fecha || new Date().toISOString().split("T")[0];

    // Si se proporciona categoría, verificar que pertenece al usuario
    if (categoria_id) {
      const cat = await pool.query(
        "SELECT id FROM categorias_finanzas WHERE id = $1 AND usuario_id = $2",
        [categoria_id, req.usuario.id]
      );
      if (cat.rows.length === 0) {
        return res.status(400).json({ ok: false, mensaje: "Categoría no válida." });
      }
    }

    const resultado = await pool.query(
      `INSERT INTO ingresos (usuario_id, categoria_id, monto, descripcion, fecha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, monto, descripcion, fecha, categoria_id, creado_en`,
      [req.usuario.id, categoria_id || null, Number(monto), descripcion?.trim() || null, fechaValida]
    );
    res.status(201).json({ ok: true, mensaje: "Ingreso registrado.", ingreso: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear ingreso.", error: error.message });
  }
}

/**
 * PUT /api/finanzas/ingresos/:id
 */
async function actualizarIngreso(req, res) {
  try {
    const { id } = req.params;
    const { monto, descripcion, categoria_id, fecha } = req.body;

    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      return res.status(400).json({ ok: false, mensaje: "El monto debe ser un número mayor a 0." });
    }

    const existente = await pool.query(
      "SELECT id FROM ingresos WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );
    if (existente.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Ingreso no encontrado." });
    }

    const resultado = await pool.query(
      `UPDATE ingresos
       SET monto = $1, descripcion = $2, categoria_id = $3, fecha = $4, actualizado_en = NOW()
       WHERE id = $5 AND usuario_id = $6
       RETURNING id, monto, descripcion, fecha, categoria_id, actualizado_en`,
      [Number(monto), descripcion?.trim() || null, categoria_id || null, fecha, id, req.usuario.id]
    );
    res.json({ ok: true, mensaje: "Ingreso actualizado.", ingreso: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar ingreso.", error: error.message });
  }
}

/**
 * DELETE /api/finanzas/ingresos/:id
 */
async function eliminarIngreso(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Ingreso no encontrado." });
    }
    res.json({ ok: true, mensaje: "Ingreso eliminado." });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar ingreso.", error: error.message });
  }
}

/**
 * GET /api/finanzas/ingresos/resumen
 * Devuelve total de ingresos del mes actual y total general
 */
async function resumenIngresos(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT
         COALESCE(SUM(monto), 0) AS total_general,
         COALESCE(SUM(CASE WHEN TO_CHAR(fecha, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') THEN monto ELSE 0 END), 0) AS total_mes_actual
       FROM ingresos
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ ok: true, resumen: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al calcular resumen de ingresos.", error: error.message });
  }
}

module.exports = { listarIngresos, crearIngreso, actualizarIngreso, eliminarIngreso, resumenIngresos };
