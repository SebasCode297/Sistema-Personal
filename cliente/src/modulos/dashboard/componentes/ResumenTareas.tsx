import React from "react";
import { TarjetaMetrica } from "./TarjetaMetrica";

interface ResumenTareasProps {
  pendientes?: number;
  enProgreso?: number;
}

export const ResumenTareas: React.FC<ResumenTareasProps> = ({
  pendientes = 0,
}) => {
  return (
    <TarjetaMetrica
      etiqueta="Tareas"
      valor={`${pendientes} pendientes`}
      subtexto="Actividades por completar"
      badgeTexto="Fase 5"
      badgeTipo="normal"
      textoEstado="Módulo en preparación"
      enlaceTexto="Ver tareas"
    />
  );
};
