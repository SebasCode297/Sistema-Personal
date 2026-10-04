const { pool } = require("../../db");

/**
 * GET /api/finanzas/gastos
 * Acepta query params: ?mes=YYYY-MM para filtrar por mes
 */
async function listarGastos(req, res) {
  try {
    const { mes } = req.query;
    let query = `
      SELECT g.id, g.monto, g.descripcion, g.fecha,
             c.nombre AS categoria_nombre, c.id AS categoria_id,
             g.creado_en
      FROM gastos g
      LEFT JOIN categorias_finanzas c ON c.id = g.categoria_id
      WHERE g.usuario_id = $1
    `;
    const params = [req.usuario.id];

    if (mes) {
      query += ` AND TO_CHAR(g.fecha, 'YYYY-MM') = $2`;
      params.push(mes);
    }

    query += " ORDER BY g.fecha DESC, g.creado_en DESC";

    const resultado = await pool.query(query, params);
    res.json({ ok: true, gastos: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener gastos.", error: error.message });
  }
}

/**
 * POST /api/finanzas/gastos
 */
async function crearGasto(req, res) {
  try {
    const { monto, descripcion, categoria_id, fecha } = req.body;

    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      return res.status(400).json({ ok: false, mensaje: "El monto debe ser un número mayor a 0." });
    }

    const fechaValida = fecha || new Date().toISOString().split("T")[0];

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
      `INSERT INTO gastos (usuario_id, categoria_id, monto, descripcion, fecha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, monto, descripcion, fecha, categoria_id, creado_en`,
      [req.usuario.id, categoria_id || null, Number(monto), descripcion?.trim() || null, fechaValida]
    );
    res.status(201).json({ ok: true, mensaje: "Gasto registrado.", gasto: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear gasto.", error: error.message });
  }
}

/**
 * PUT /api/finanzas/gastos/:id
 */
async function actualizarGasto(req, res) {
  try {
    const { id } = req.params;
    const { monto, descripcion, categoria_id, fecha } = req.body;

    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      return res.status(400).json({ ok: false, mensaje: "El monto debe ser un número mayor a 0." });
    }

    const existente = await pool.query(
      "SELECT id FROM gastos WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );
    if (existente.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Gasto no encontrado." });
    }

    const resultado = await pool.query(
      `UPDATE gastos
       SET monto = $1, descripcion = $2, categoria_id = $3, fecha = $4, actualizado_en = NOW()
       WHERE id = $5 AND usuario_id = $6
       RETURNING id, monto, descripcion, fecha, categoria_id, actualizado_en`,
      [Number(monto), descripcion?.trim() || null, categoria_id || null, fecha, id, req.usuario.id]
    );
    res.json({ ok: true, mensaje: "Gasto actualizado.", gasto: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar gasto.", error: error.message });
  }
}

/**
 * DELETE /api/finanzas/gastos/:id
 */
async function eliminarGasto(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM gastos WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Gasto no encontrado." });
    }
    res.json({ ok: true, mensaje: "Gasto eliminado." });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar gasto.", error: error.message });
  }
}

/**
 * GET /api/finanzas/gastos/resumen
 * Total de gastos del mes actual y total general
 */
async function resumenGastos(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT
         COALESCE(SUM(monto), 0) AS total_general,
         COALESCE(SUM(CASE WHEN TO_CHAR(fecha, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') THEN monto ELSE 0 END), 0) AS total_mes_actual
       FROM gastos
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ ok: true, resumen: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al calcular resumen de gastos.", error: error.message });
  }
}

/**
 * GET /api/finanzas/gastos/por-categoria
 * Agrupa los gastos del mes por categoría
 */
async function gastosPorCategoria(req, res) {
  try {
    const { mes } = req.query;
    const filtroMes = mes || new Date().toISOString().slice(0, 7);

    const resultado = await pool.query(
      `SELECT
         COALESCE(c.nombre, 'Sin categoría') AS categoria,
         SUM(g.monto) AS total,
         COUNT(*) AS cantidad
       FROM gastos g
       LEFT JOIN categorias_finanzas c ON c.id = g.categoria_id
       WHERE g.usuario_id = $1 AND TO_CHAR(g.fecha, 'YYYY-MM') = $2
       GROUP BY c.nombre
       ORDER BY total DESC`,
      [req.usuario.id, filtroMes]
    );
    res.json({ ok: true, datos: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener gastos por categoría.", error: error.message });
  }
}

module.exports = { listarGastos, crearGasto, actualizarGasto, eliminarGasto, resumenGastos, gastosPorCategoria };
