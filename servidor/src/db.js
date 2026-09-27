const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function verificarConexion() {
  const resultado = await pool.query("SELECT NOW() AS ahora, current_database() AS base_datos");
  return resultado.rows[0];
}

module.exports = {
  pool,
  verificarConexion,
};
