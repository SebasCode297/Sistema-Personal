-- MiPanel — Fase 5: Módulo de Tareas
-- Independiente de Finanzas, Metas y Calendario.

CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(10) NOT NULL DEFAULT 'media'
        CHECK (prioridad IN ('baja', 'media', 'alta')),
    fecha_limite DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tareas_usuario ON tareas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas (usuario_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas (usuario_id, prioridad);

COMMENT ON TABLE tareas IS 'Módulo Tareas: actividades personales. Independiente de otros módulos.';
