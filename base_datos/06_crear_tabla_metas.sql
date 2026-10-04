-- MiPanel — Fase 6: Módulo de Metas Personales
-- Independiente de Finanzas, Tareas y Calendario.

CREATE TABLE IF NOT EXISTS metas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    -- Valor objetivo y valor actual para calcular porcentaje de progreso
    valor_objetivo NUMERIC(12, 2) NOT NULL DEFAULT 100,
    valor_actual NUMERIC(12, 2) NOT NULL DEFAULT 0,
    -- Unidad libre: %, km, libros, días, etc.
    unidad VARCHAR(50) DEFAULT '%',
    estado VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (estado IN ('activa', 'pausada', 'completada', 'abandonada')),
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_estado ON metas (usuario_id, estado);

COMMENT ON TABLE metas IS 'Módulo Metas: objetivos personales con seguimiento de progreso. Independiente de otros módulos.';
