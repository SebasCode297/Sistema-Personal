const { pool } = require("../../db");

const CATEGORIAS_DEFAULT = [
  { nombre: "Salario", tipo: "ingreso" },
  { nombre: "Freelance", tipo: "ingreso" },
  { nombre: "Inversiones", tipo: "ingreso" },
  { nombre: "Otros ingresos", tipo: "ingreso" },
  { nombre: "Alimentación", tipo: "gasto" },
  { nombre: "Transporte", tipo: "gasto" },
  { nombre: "Entretenimiento", tipo: "gasto" },
  { nombre: "Servicios", tipo: "gasto" },
  { nombre: "Compras", tipo: "gasto" },
  { nombre: "Salud", tipo: "gasto" },
  { nombre: "Otros gastos", tipo: "gasto" },
];

/**
 * Crea las categorías por defecto para un usuario nuevo.
 * Se llama internamente desde el registro de usuario.
 */
async function crearCategoriasIniciales(usuarioId) {
  const valores = CATEGORIAS_DEFAULT.map((c, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ");
  const params = [usuarioId, ...CATEGORIAS_DEFAULT.flatMap((c) => [c.nombre, c.tipo])];
  await pool.query(
    `INSERT INTO categorias_finanzas (usuario_id, nombre, tipo) VALUES ${valores}`,
    params
  );
}

/**
 * GET /api/finanzas/categorias
 */
async function listarCategorias(req, res) {
  try {
    let resultado = await pool.query(
      "SELECT id, nombre, tipo, creado_en FROM categorias_finanzas WHERE usuario_id = $1 ORDER BY tipo, nombre",
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      await crearCategoriasIniciales(req.usuario.id);
      resultado = await pool.query(
        "SELECT id, nombre, tipo, creado_en FROM categorias_finanzas WHERE usuario_id = $1 ORDER BY tipo, nombre",
        [req.usuario.id]
      );
    }

    res.json({ ok: true, categorias: resultado.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener categorías.", error: error.message });
  }
}

/**
 * POST /api/finanzas/categorias
 */
async function crearCategoria(req, res) {
  try {
    const { nombre, tipo } = req.body;

    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
      return res.status(400).json({ ok: false, mensaje: "El nombre debe tener al menos 2 caracteres." });
    }
    if (!tipo || !["ingreso", "gasto", "ambos"].includes(tipo)) {
      return res.status(400).json({ ok: false, mensaje: "El tipo debe ser: ingreso, gasto o ambos." });
    }

    const resultado = await pool.query(
      "INSERT INTO categorias_finanzas (usuario_id, nombre, tipo) VALUES ($1, $2, $3) RETURNING *",
      [req.usuario.id, nombre.trim(), tipo]
    );
    res.status(201).json({ ok: true, mensaje: "Categoría creada.", categoria: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear categoría.", error: error.message });
  }
}

/**
 * DELETE /api/finanzas/categorias/:id
 */
async function eliminarCategoria(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM categorias_finanzas WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [id, req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Categoría no encontrada." });
    }
    res.json({ ok: true, mensaje: "Categoría eliminada." });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar categoría.", error: error.message });
  }
}

module.exports = { listarCategorias, crearCategoria, eliminarCategoria, crearCategoriasIniciales };
