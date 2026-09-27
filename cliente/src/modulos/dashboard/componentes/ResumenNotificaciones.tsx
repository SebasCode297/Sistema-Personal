import React from "react";
import { TarjetaMetrica } from "./TarjetaMetrica";

interface ResumenNotificacionesProps {
  noLeidas?: number;
}

export const ResumenNotificaciones: React.FC<ResumenNotificacionesProps> = ({
  noLeidas = 0,
}) => {
  return (
    <TarjetaMetrica
      etiqueta="Notificaciones"
      valor={noLeidas > 0 ? `${noLeidas} nuevas` : "Al día"}
      subtexto="Avisos y alertas del sistema"
      badgeTexto="Fase 8"
      badgeTipo="normal"
      textoEstado="Sin alertas pendientes"
      enlaceTexto="Ver avisos"
    />
  );
};
