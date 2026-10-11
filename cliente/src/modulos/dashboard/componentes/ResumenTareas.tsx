import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { tareasServicio } from "../../tareas/servicios/tareasServicio";

export const ResumenTareas: React.FC = () => {
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const respuesta = await tareasServicio.resumen();
        setPendientes(respuesta.ok ? Number(respuesta.resumen.pendientes) : 0);
      } catch {
        setPendientes(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Tareas"
      valor={cargando ? "Cargando..." : `${pendientes} pendientes`}
      subtexto="Actividades pendientes"
      badgeTexto="Activo"
      badgeTipo="positivo"
      textoEstado="Por completar"
      enlaceTexto="Ver tareas"
      onClickEnlace={() => navigate("/tareas")}
    />
  );
};
