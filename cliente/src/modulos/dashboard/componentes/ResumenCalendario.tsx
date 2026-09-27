import React from "react";
import { TarjetaMetrica } from "./TarjetaMetrica";

interface ResumenCalendarioProps {
  eventosProximos?: number;
}

export const ResumenCalendario: React.FC<ResumenCalendarioProps> = ({
  eventosProximos = 0,
}) => {
  return (
    <TarjetaMetrica
      etiqueta="Calendario"
      valor={`${eventosProximos} próximos`}
      subtexto="Citas y recordatorios agendados"
      badgeTexto="Fase 7"
      badgeTipo="normal"
      textoEstado="Módulo en preparación"
      enlaceTexto="Abrir agenda"
    />
  );
};
