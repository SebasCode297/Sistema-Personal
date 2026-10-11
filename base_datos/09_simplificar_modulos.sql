-- Quitar Finanzas y Calendario, simplificar Tareas y vincular avisos a Metas.

DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;
DROP TABLE IF EXISTS categorias_finanzas CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;

UPDATE tareas SET estado = 'pendiente' WHERE estado = 'en_progreso';

ALTER TABLE tareas DROP CONSTRAINT IF EXISTS tareas_estado_check;
ALTER TABLE tareas ADD CONSTRAINT tareas_estado_check CHECK (estado IN ('pendiente', 'completada'));

ALTER TABLE tareas DROP COLUMN IF EXISTS prioridad;
ALTER TABLE tareas DROP COLUMN IF EXISTS monto;

DROP INDEX IF EXISTS idx_tareas_prioridad;

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS meta_id INTEGER REFERENCES metas(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notificaciones_meta ON notificaciones (meta_id);
