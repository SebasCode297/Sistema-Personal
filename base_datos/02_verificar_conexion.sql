-- MiPanel — Fase 1
-- Ejecutar conectado a la base mipanel para comprobar que responde.

SELECT current_database() AS base_datos,
       current_user       AS usuario,
       NOW()              AS hora_servidor;
