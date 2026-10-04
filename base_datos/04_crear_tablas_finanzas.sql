-- MiPanel — Fase 4: Módulo de Finanzas
-- Tablas independientes. No tienen relación con Tareas, Metas ni Calendario.

-- Categorías de movimientos financieros
CREATE TABLE IF NOT EXISTS categorias_finanzas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'ambos')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cat_finanzas_usuario ON categorias_finanzas (usuario_id);

-- Ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias_finanzas(id) ON DELETE SET NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    descripcion VARCHAR(255),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingresos_usuario ON ingresos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos (fecha DESC);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias_finanzas(id) ON DELETE SET NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    descripcion VARCHAR(255),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastos_usuario ON gastos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos (fecha DESC);

COMMENT ON TABLE categorias_finanzas IS 'Módulo Finanzas: categorías personalizadas por usuario.';
COMMENT ON TABLE ingresos IS 'Módulo Finanzas: ingresos del usuario. Independiente de otros módulos.';
COMMENT ON TABLE gastos IS 'Módulo Finanzas: gastos del usuario. Independiente de otros módulos.';
