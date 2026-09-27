# MiPanel

Centro de control personal. Cada módulo (Finanzas, Tareas, Metas, Calendario, Notificaciones y Perfil) se desarrolla de forma independiente.

## Estructura

```text
Proyecto Personal
├── cliente/      React + TypeScript + Vite
├── servidor/     Node.js + Express + API REST
└── base_datos/   Scripts SQL de PostgreSQL
```

## Fase actual: 1 — Configuración

Objetivo: dejar funcionando el cliente, el servidor y la conexión a PostgreSQL. Todavía no hay autenticación ni módulos.

## Requisitos

- Node.js 22
- PostgreSQL 17
- Git

## Cómo arrancar

1. Crear la base `mipanel` con `base_datos/01_crear_base_datos.sql` (pgAdmin o psql).
2. Copiar `servidor/.env.example` a `servidor/.env` y poner la contraseña de PostgreSQL.
3. En una terminal:

```bash
cd servidor
npm install
npm run dev
```

4. En otra terminal:

```bash
cd cliente
npm install
npm run dev
```

5. Abrir http://localhost:5173 y pulsar **Comprobar API y base de datos**.

La API de salud queda en http://localhost:4000/api/salud
