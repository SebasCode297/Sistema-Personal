import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { finanzasServicio } from "../../finanzas/servicios/finanzasServicio";

export const ResumenFinanzas: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [cargando, setCargando] = useState(true);

  const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" });

  useEffect(() => {
    async function cargar() {
      try {
        const [resI, resG] = await Promise.all([
          finanzasServicio.resumenIngresos(),
          finanzasServicio.resumenGastos(),
        ]);
        const ingresos = resI.ok ? parseFloat(resI.resumen.total_mes_actual) : 0;
        const gastos = resG.ok ? parseFloat(resG.resumen.total_mes_actual) : 0;
        setBalance(ingresos - gastos);
      } catch {
        setBalance(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Finanzas"
      valor={cargando ? "Cargando..." : fmt.format(balance)}
      subtexto="Balance del mes actual"
      badgeTexto={balance >= 0 ? "Positivo" : "Negativo"}
      badgeTipo={balance >= 0 ? "positivo" : "alerta"}
      textoEstado="Módulo activo"
      enlaceTexto="Ver finanzas"
      onClickEnlace={() => navigate("/finanzas")}
    />
  );
};
