-- ==============================================================================
-- Fase 8: Creación de la tabla de Notificaciones y Alertas
-- Sistema: MiPanel
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'info', -- 'info', 'alerta', 'recordatorio', 'sistema'
    leida BOOLEAN DEFAULT false,
    enlace VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda rápida por usuario y estado de lectura
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
