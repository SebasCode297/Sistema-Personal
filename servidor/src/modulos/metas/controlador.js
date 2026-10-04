const { pool } = require("../../db");

const ESTADOS = ["activa", "pausada", "completada", "abandonada"];

function validarMeta(body, esActualizacion = false) {
  const { titulo, valor_objetivo, valor_actual, estado, fecha_fin } = body;

  if (!esActualizacion || titulo !== undefined) {
    if (!titulo || typeof titulo !== "string" || titulo.trim().length < 2) {
      return "El título es obligatorio y debe tener al menos 2 caracteres.";
    }
  }

  if (valor_objetivo !== undefined) {
    if (isNaN(Number(valor_objetivo)) || Number(valor_objetivo) <= 0) {
      return "El valor objetivo debe ser un número mayor a 0.";
    }
  }

  if (valor_actual !== undefined) {
    if (isNaN(Number(valor_actual)) || Number(valor_actual) < 0) {
      return "El valor actual no puede ser negativo.";
    }
  }

  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return `El estado debe ser: ${ESTADOS.join(", ")}.`;
  }

  if (fecha_fin !== undefined && fecha_fin !== null && fecha_fin !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin)) {
      return "La fecha de fin debe tener el formato YYYY-MM-DD.";
    }
  }

  return null;
}

/**
 * GET /api/metas
 * Filtra por estado opcional: ?estado=activa
 */
async function listarMetas(req, res) {
  try {
    const { estado } = req.query;
    const params = [req.usuario.id];
    let query = `
      SELECT id, titulo, descripcion, valor_objetivo, valor_actual, unidad,
             estado, fecha_inicio, fecha_fin, creado_en, actualizado_en
      FROM metas
      WHERE usuario_id = $1
    `;

    if (estado) {
      if (!ESTADOS.includes(estado)) {
        return res.status(400).json({ ok: false, mensaje: "Estado de filtro no válido." });
      }
      params.push(estado);
      query += ` AND estado = $${params.length}`;
    }

    query += `
      ORDER BY
        CASE estado
          WHEN 'activa' THEN 1
          WHEN 'pausada' THEN 2
          WHEN 'completada' THEN 3
          ELSE 4
        END,
        creado_en DESC
    `;

    const resultado = await pool.query(query, params);
    res.json({ ok: true, metas: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener metas.", error: error.message });
  }
}

/**
 * POST /api/metas
 */
async function crearMeta(req, res) {
  try {
    const error = validarMeta(req.body);
    if (error) return res.status(400).json({ ok: false, mensaje: error });

    const { titulo, descripcion, valor_objetivo, valor_actual, unidad, estado, fecha_inicio, fecha_fin } = req.body;

    const resultado = await pool.query(
      `INSERT INTO metas
         (usuario_id, titulo, descripcion, valor_objetivo, valor_actual, unidad, estado, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.usuario.id,
        titulo.trim(),
        descripcion?.trim() || null,
        Number(valor_objetivo) || 100,
        Number(valor_actual) || 0,
        unidad?.trim() || "%",
        estado || "activa",
        fecha_inicio || new Date().toISOString().split("T")[0],
        fecha_fin || null,
      ]
    );
    res.status(201).json({ ok: true, mensaje: "Meta creada.", meta: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear la meta.", error: error.message });
  }
}

/**
 * PUT /api/metas/:id
 */
async function actualizarMeta(req, res) {
  try {
    const { id } = req.params;
    const error = validarMeta(req.body, true);
    if (error) return res.status(400).json({ ok: false, mensaje: error });

    const existente = await pool.query(
      "SELECT id FROM metas WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );
    if (existente.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Meta no encontrada." });
    }

    const { titulo, descripcion, valor_objetivo, valor_actual, unidad, estado, fecha_inicio, fecha_fin } = req.body;

    const resultado = await pool.query(
      `UPDATE metas
       SET titulo = COALESCE($1, titulo),
           descripcion = $2,
           valor_objetivo = COALESCE($3, valor_objetivo),
           valor_actual = COALESCE($4, valor_actual),
           unidad = COALESCE($5, unidad),
           estado = COALESCE($6, estado),
           fecha_inicio = COALESCE($7, fecha_inicio),
           fecha_fin = $8,
           actualizado_en = NOW()
       WHERE id = $9 AND usuario_id = $10
       RETURNING *`,
      [
        titulo?.trim() || null,
        descripcion !== undefined ? descripcion?.trim() || null : undefined,
        valor_objetivo !== undefined ? Number(valor_objetivo) : null,
        valor_actual !== undefined ? Number(valor_actual) : null,
        unidad?.trim() || null,
        estado || null,
        fecha_inicio || null,
        fecha_fin || null,
        id,
        req.usuario.id,
      ]
    );
    res.json({ ok: true, mensaje: "Meta actualizada.", meta: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar la meta.", error: error.message });
  }
}

/**
 * PATCH /api/metas/:id/progreso
 * Actualiza solo el valor_actual (actualización rápida de progreso)
 */
async function actualizarProgreso(req, res) {
  try {
    const { id } = req.params;
    const { valor_actual } = req.body;

    if (valor_actual === undefined || isNaN(Number(valor_actual)) || Number(valor_actual) < 0) {
      return res.status(400).json({ ok: false, mensaje: "El valor actual debe ser un número mayor o igual a 0." });
    }

    const resultado = await pool.query(
      `UPDATE metas
       SET valor_actual = $1, actualizado_en = NOW()
       WHERE id = $2 AND usuario_id = $3
       RETURNING id, valor_actual, valor_objetivo, estado, actualizado_en`,
      [Number(valor_actual), id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Meta no encontrada." });
    }

    res.json({ ok: true, mensaje: "Progreso actualizado.", meta: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar progreso.", error: error.message });
  }
}

/**
 * DELETE /api/metas/:id
 */
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

/**
 * GET /api/metas/resumen
 */
async function resumenMetas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'activa') AS activas,
         COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
         COUNT(*) FILTER (WHERE estado = 'pausada') AS pausadas,
         COUNT(*) AS total
       FROM metas
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ ok: true, resumen: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al calcular el resumen de metas.", error: error.message });
  }
}

module.exports = { listarMetas, crearMeta, actualizarMeta, actualizarProgreso, eliminarMeta, resumenMetas };
