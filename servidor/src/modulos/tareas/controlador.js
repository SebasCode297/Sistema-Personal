const { pool } = require("../../db");

const PRIORIDADES = ["baja", "media", "alta"];
const ESTADOS = ["pendiente", "en_progreso", "completada"];

function validarTarea(body, esActualizacion = false) {
  const { titulo, descripcion, prioridad, fecha_limite, estado } = body;

  if (!esActualizacion || titulo !== undefined) {
    if (!titulo || typeof titulo !== "string" || titulo.trim().length < 2) {
      return "El título es obligatorio y debe tener al menos 2 caracteres.";
    }
  }

  if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
    return "La prioridad debe ser: baja, media o alta.";
  }

  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return "El estado debe ser: pendiente, en_progreso o completada.";
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== "string") {
    return "La descripción no es válida.";
  }

  if (fecha_limite !== undefined && fecha_limite !== null && fecha_limite !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_limite)) {
      return "La fecha límite debe tener el formato YYYY-MM-DD.";
    }
  }

  return null;
}

async function listarTareas(req, res) {
  try {
    const { estado, prioridad } = req.query;
    const params = [req.usuario.id];
    let query = `
      SELECT id, titulo, descripcion, prioridad, fecha_limite, estado, creado_en, actualizado_en
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

    if (prioridad) {
      if (!PRIORIDADES.includes(prioridad)) {
        return res.status(400).json({ ok: false, mensaje: "Prioridad de filtro no válida." });
      }
      params.push(prioridad);
      query += ` AND prioridad = $${params.length}`;
    }

    query += `
      ORDER BY
        CASE estado
          WHEN 'pendiente' THEN 1
          WHEN 'en_progreso' THEN 2
          ELSE 3
        END,
        CASE prioridad
          WHEN 'alta' THEN 1
          WHEN 'media' THEN 2
          ELSE 3
        END,
        fecha_limite ASC NULLS LAST,
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

    const { titulo, descripcion, prioridad, fecha_limite, estado } = req.body;

    const resultado = await pool.query(
      `INSERT INTO tareas (usuario_id, titulo, descripcion, prioridad, fecha_limite, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, titulo, descripcion, prioridad, fecha_limite, estado, creado_en, actualizado_en`,
      [
        req.usuario.id,
        titulo.trim(),
        descripcion?.trim() || null,
        prioridad || "media",
        fecha_limite || null,
        estado || "pendiente",
      ]
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

    const { titulo, descripcion, prioridad, fecha_limite, estado } = req.body;

    const resultado = await pool.query(
      `UPDATE tareas
       SET titulo = $1,
           descripcion = $2,
           prioridad = $3,
           fecha_limite = $4,
           estado = $5,
           actualizado_en = NOW()
       WHERE id = $6 AND usuario_id = $7
       RETURNING id, titulo, descripcion, prioridad, fecha_limite, estado, creado_en, actualizado_en`,
      [
        titulo.trim(),
        descripcion?.trim() || null,
        prioridad || "media",
        fecha_limite || null,
        estado || "pendiente",
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
         COUNT(*) FILTER (WHERE estado = 'en_progreso') AS en_progreso,
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
