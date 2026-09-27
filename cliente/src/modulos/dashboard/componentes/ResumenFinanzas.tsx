import React from "react";
import { TarjetaMetrica } from "./TarjetaMetrica";

interface ResumenFinanzasProps {
  balance?: number;
  ingresosMes?: number;
  gastosMes?: number;
}

export const ResumenFinanzas: React.FC<ResumenFinanzasProps> = ({
  balance = 0,
}) => {
  const formateador = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  });

  return (
    <TarjetaMetrica
      etiqueta="Finanzas"
      valor={formateador.format(balance)}
      subtexto="Balance disponible actual"
      badgeTexto="Fase 4"
      badgeTipo="normal"
      textoEstado="Módulo en preparación"
      enlaceTexto="Ver finanzas"
    />
  );
};
