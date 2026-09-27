-- MiPanel — Fase 2: Autenticación
-- Tabla de usuarios independientes.
-- Almacena credenciales seguras (contraseña hasheada con bcrypt).

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

COMMENT ON TABLE usuarios IS 'Módulo de autenticación: usuarios registrados del sistema MiPanel.';
