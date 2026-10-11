const { pool } = require("../../db");

const ESTADOS = ["pendiente", "completada"];

function validarTarea(body) {
  const { titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto } = body;

  if (!titulo || typeof titulo !== "string" || titulo.trim().length < 2) {
    return "El título es obligatorio y debe tener al menos 2 caracteres.";
  }

  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return "El estado debe ser: pendiente o completada.";
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== "string") {
    return "La descripción no es válida.";
  }

  if (fecha_inicio !== undefined && fecha_inicio !== null && fecha_inicio !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio)) {
      return "La fecha de inicio debe tener el formato YYYY-MM-DD.";
    }
  }

  const fin = fecha_fin || fecha_limite;
  if (fin !== undefined && fin !== null && fin !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fin)) {
      return "La fecha de fin debe tener el formato YYYY-MM-DD.";
    }
  }

  if (monto !== undefined && monto !== null && monto !== "") {
    const num = Number(monto);
    if (isNaN(num) || num < 0) {
      return "El monto debe ser un número válido mayor o igual a 0.";
    }
  }

  return null;
}

async function listarTareas(req, res) {
  try {
    const { estado } = req.query;
    const params = [req.usuario.id];
    let query = `
      SELECT id, titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto, creado_en, actualizado_en
      FROM tareas
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
        CASE estado WHEN 'pendiente' THEN 1 ELSE 2 END,
        COALESCE(fecha_fin, fecha_limite) ASC NULLS LAST,
        creado_en DESC
    `;

    const resultado = await pool.query(query, params);
    res.json({ ok: true, tareas: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener tareas.", error: error.message });
  }
}

async function crearTarea(req, res) {
  try {
    const error = validarTarea(req.body);
    if (error) {
      return res.status(400).json({ ok: false, mensaje: error });
    }

    const { titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, monto } = req.body;
    const fin = fecha_fin || fecha_limite || null;
    const inicio = fecha_inicio || null;
    const numMonto = monto !== undefined && monto !== null && monto !== "" ? parseFloat(monto) : null;

    const resultado = await pool.query(
      `INSERT INTO tareas (usuario_id, titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7)
       RETURNING id, titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto, creado_en, actualizado_en`,
      [req.usuario.id, titulo.trim(), descripcion?.trim() || null, inicio, fin, fin, numMonto]
    );

    res.status(201).json({ ok: true, mensaje: "Tarea creada.", tarea: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear la tarea.", error: error.message });
  }
}

async function actualizarTarea(req, res) {
  try {
    const { id } = req.params;
    const error = validarTarea(req.body);
    if (error) {
      return res.status(400).json({ ok: false, mensaje: error });
    }

    const existente = await pool.query(
      "SELECT id FROM tareas WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );
    if (existente.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Tarea no encontrada." });
    }

    const { titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto } = req.body;
    const fin = fecha_fin !== undefined ? (fecha_fin || null) : (fecha_limite !== undefined ? (fecha_limite || null) : null);
    const inicio = fecha_inicio !== undefined ? (fecha_inicio || null) : null;
    const numMonto = monto !== undefined && monto !== null && monto !== "" ? parseFloat(monto) : null;

    const resultado = await pool.query(
      `UPDATE tareas
       SET titulo = $1,
           descripcion = $2,
           fecha_inicio = $3,
           fecha_fin = $4,
           fecha_limite = $5,
           estado = $6,
           monto = $7,
           actualizado_en = NOW()
       WHERE id = $8 AND usuario_id = $9
       RETURNING id, titulo, descripcion, fecha_inicio, fecha_fin, fecha_limite, estado, monto, creado_en, actualizado_en`,
      [
        titulo.trim(),
        descripcion?.trim() || null,
        inicio,
        fin,
        fin,
        estado || "pendiente",
        numMonto,
        id,
        req.usuario.id,
      ]
    );

    res.json({ ok: true, mensaje: "Tarea actualizada.", tarea: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar la tarea.", error: error.message });
  }
}

async function eliminarTarea(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM tareas WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Tarea no encontrada." });
    }
    res.json({ ok: true, mensaje: "Tarea eliminada." });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar la tarea.", error: error.message });
  }
}

async function resumenTareas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
         COUNT(*) FILTER (WHERE estado = 'completada') AS completadas
       FROM tareas
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ ok: true, resumen: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al calcular el resumen de tareas.", error: error.message });
  }
}

module.exports = { listarTareas, crearTarea, actualizarTarea, eliminarTarea, resumenTareas };
