const { pool } = require("../../db");

/**
 * GET /api/finanzas/evolucion-mensual
 * Últimos 6 meses de ingresos y gastos. Solo módulo Finanzas.
 */
async function evolucionMensual(req, res) {
  try {
    const resultado = await pool.query(
      `WITH meses AS (
         SELECT TO_CHAR(d, 'YYYY-MM') AS mes
         FROM generate_series(
           date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
           date_trunc('month', CURRENT_DATE),
           INTERVAL '1 month'
         ) AS d
       )
       SELECT
         m.mes,
         COALESCE((
           SELECT SUM(monto) FROM ingresos
           WHERE usuario_id = $1 AND TO_CHAR(fecha, 'YYYY-MM') = m.mes
         ), 0) AS ingresos,
         COALESCE((
           SELECT SUM(monto) FROM gastos
           WHERE usuario_id = $1 AND TO_CHAR(fecha, 'YYYY-MM') = m.mes
         ), 0) AS gastos
       FROM meses m
       ORDER BY m.mes`,
      [req.usuario.id]
    );

    res.json({ ok: true, datos: resultado.rows });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener la evolución mensual.",
      error: error.message,
    });
  }
}

module.exports = { evolucionMensual };
