const { pool } = require("../../db");

const DIAS_AVISO = 7;

function obtenerFechaYMD(fechaObj) {
  if (!fechaObj) return null;
  if (fechaObj instanceof Date) {
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }
  if (typeof fechaObj === "string") {
    return fechaObj.split("T")[0];
  }
  return null;
}

function formatearFechaEspanol(anio, mes, dia) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${dia} de ${meses[mes - 1]} de ${anio}`;
}

function mensajeAviso(titulo, ymd, diasRestantes) {
  const [anioStr, mesStr, diaStr] = ymd.split("-");
  const fechaTexto = formatearFechaEspanol(
    parseInt(anioStr, 10),
    parseInt(mesStr, 10),
    parseInt(diaStr, 10)
  );

  if (diasRestantes < 0) {
    return `La meta "${titulo}" venció el ${fechaTexto}.`;
  }
  if (diasRestantes === 0) {
    return `Hoy vence la meta "${titulo}".`;
  }
  if (diasRestantes === 1) {
    return `Mañana vence la meta "${titulo}" (${fechaTexto}).`;
  }
  return `La meta "${titulo}" vence el ${fechaTexto} (faltan ${diasRestantes} días).`;
}

async function asegurarColumna() {
  try {
    await pool.query("ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS meta_id INTEGER");
  } catch (err) {
    console.error("Error asegurando columna meta_id:", err.message);
  }
}

async function generarAvisosDeMetas(usuarioId) {
  try {
    await asegurarColumna();

    const metas = await pool.query(
      `SELECT id, titulo, fecha_fin
       FROM metas
       WHERE usuario_id = $1
         AND fecha_fin IS NOT NULL`,
      [usuarioId]
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (const meta of metas.rows) {
      const ymd = obtenerFechaYMD(meta.fecha_fin);
      if (!ymd) continue;

      const [anioStr, mesStr, diaStr] = ymd.split("-");
      const limite = new Date(parseInt(anioStr, 10), parseInt(mesStr, 10) - 1, parseInt(diaStr, 10));
      limite.setHours(0, 0, 0, 0);

      const diasRestantes = Math.round((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diasRestantes > DIAS_AVISO) {
        continue;
      }

      const existente = await pool.query(
        `SELECT id FROM notificaciones
         WHERE usuario_id = $1 AND meta_id = $2
         LIMIT 1`,
        [usuarioId, meta.id]
      );

      if (existente.rows.length > 0) {
        continue;
      }

      await pool.query(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, enlace, meta_id)
         VALUES ($1, $2, $3, 'recordatorio', '/metas', $4)`,
        [
          usuarioId,
          "Meta próxima a vencer",
          mensajeAviso(meta.titulo, ymd, diasRestantes),
          meta.id,
        ]
      );
    }
  } catch (error) {
    console.error("Error al generar avisos de metas:", error.message);
  }
}

module.exports = { generarAvisosDeMetas };
