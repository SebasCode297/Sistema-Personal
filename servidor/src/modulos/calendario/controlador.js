const { pool } = require("../../db");

/**
 * Obtener todos los eventos del usuario autenticado,
 * opcionalmente filtrados por rango de fechas (desde, hasta).
 */
async function obtenerEventos(req, res) {
  const usuarioId = req.usuario.id;
  const { desde, hasta } = req.query;

  try {
    let consulta = "SELECT * FROM eventos WHERE usuario_id = $1";
    const valores = [usuarioId];

    if (desde && hasta) {
      consulta += " AND fecha_inicio >= $2 AND fecha_inicio <= $3";
      valores.push(desde, hasta);
    } else if (desde) {
      consulta += " AND fecha_inicio >= $2";
      valores.push(desde);
    }

    consulta += " ORDER BY fecha_inicio ASC";

    const resultado = await pool.query(consulta, valores);
    res.json({ ok: true, datos: resultado.rows });
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al obtener eventos" });
  }
}

/**
 * Obtener los próximos eventos pendientes (útil para el Dashboard)
 */
async function obtenerProximosEventos(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const consulta = `
      SELECT * FROM eventos 
      WHERE usuario_id = $1 
        AND fecha_inicio >= (CURRENT_TIMESTAMP - INTERVAL '2 hours')
      ORDER BY fecha_inicio ASC 
      LIMIT 5
    `;
    const resultado = await pool.query(consulta, [usuarioId]);
    res.json({ ok: true, datos: resultado.rows });
  } catch (error) {
    console.error("Error al obtener próximos eventos:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al obtener próximos eventos" });
  }
}

/**
 * Crear un nuevo evento en el calendario
 */
async function crearEvento(req, res) {
  const usuarioId = req.usuario.id;
  const {
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    todo_el_dia,
    categoria,
    ubicacion,
  } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El título es obligatorio" });
  }

  if (!fecha_inicio) {
    return res.status(400).json({ ok: false, mensaje: "La fecha de inicio es obligatoria" });
  }

  try {
    const consulta = `
      INSERT INTO eventos (
        usuario_id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        todo_el_dia,
        categoria,
        ubicacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const valores = [
      usuarioId,
      titulo.trim(),
      descripcion ? descripcion.trim() : null,
      fecha_inicio,
      fecha_fin || null,
      Boolean(todo_el_dia),
      categoria || "general",
      ubicacion ? ubicacion.trim() : null,
    ];

    const resultado = await pool.query(consulta, valores);
    res.status(201).json({ ok: true, datos: resultado.rows[0] });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al crear evento" });
  }
}

/**
 * Actualizar un evento existente
 */
async function actualizarEvento(req, res) {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    todo_el_dia,
    categoria,
    ubicacion,
  } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ ok: false, mensaje: "El título es obligatorio" });
  }

  if (!fecha_inicio) {
    return res.status(400).json({ ok: false, mensaje: "La fecha de inicio es obligatoria" });
  }

  try {
    const consulta = `
      UPDATE eventos
      SET 
        titulo = $1,
        descripcion = $2,
        fecha_inicio = $3,
        fecha_fin = $4,
        todo_el_dia = $5,
        categoria = $6,
        ubicacion = $7,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $8 AND usuario_id = $9
      RETURNING *
    `;

    const valores = [
      titulo.trim(),
      descripcion ? descripcion.trim() : null,
      fecha_inicio,
      fecha_fin || null,
      Boolean(todo_el_dia),
      categoria || "general",
      ubicacion ? ubicacion.trim() : null,
      id,
      usuarioId,
    ];

    const resultado = await pool.query(consulta, valores);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Evento no encontrado o no autorizado" });
    }

    res.json({ ok: true, datos: resultado.rows[0] });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al actualizar evento" });
  }
}

/**
 * Eliminar un evento
 */
async function eliminarEvento(req, res) {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const consulta = "DELETE FROM eventos WHERE id = $1 AND usuario_id = $2 RETURNING id";
    const resultado = await pool.query(consulta, [id, usuarioId]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Evento no encontrado o no autorizado" });
    }

    res.json({ ok: true, mensaje: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al eliminar evento" });
  }
}

module.exports = {
  obtenerEventos,
  obtenerProximosEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
};
