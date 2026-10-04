import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { calendarioServicio } from "../../calendario/servicios/calendarioServicio";

export const ResumenCalendario: React.FC = () => {
  const navigate = useNavigate();
  const [proximos, setProximos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const eventos = await calendarioServicio.obtenerProximosEventos();
        setProximos(eventos.length);
      } catch {
        setProximos(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Calendario"
      valor={cargando ? "Cargando..." : `${proximos} próximo${proximos !== 1 ? "s" : ""}`}
      subtexto="Citas y eventos programados"
      badgeTexto="Activo"
      badgeTipo="positivo"
      textoEstado="Módulo activo"
      enlaceTexto="Abrir agenda"
      onClickEnlace={() => navigate("/calendario")}
    />
  );
};
