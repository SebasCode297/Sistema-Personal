import React from "react";
import { TarjetaMetrica } from "./TarjetaMetrica";

interface ResumenMetasProps {
  activas?: number;
  completadas?: number;
}

export const ResumenMetas: React.FC<ResumenMetasProps> = ({
  activas = 0,
}) => {
  return (
    <TarjetaMetrica
      etiqueta="Metas"
      valor={`${activas} activas`}
      subtexto="Objetivos en seguimiento"
      badgeTexto="Fase 6"
      badgeTipo="normal"
      textoEstado="Módulo en preparación"
      enlaceTexto="Ver metas"
    />
  );
};
