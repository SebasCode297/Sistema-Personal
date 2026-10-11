import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { notificacionesServicio } from "../../notificaciones/servicios/notificacionesServicio";

export const ResumenNotificaciones: React.FC = () => {
  const navigate = useNavigate();
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const resumen = await notificacionesServicio.obtenerResumen();
        setNoLeidas(resumen.no_leidas);
      } catch {
        setNoLeidas(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Notificaciones"
      valor={cargando ? "Cargando..." : noLeidas > 0 ? `${noLeidas} nueva${noLeidas !== 1 ? "s" : ""}` : "Al día"}
      subtexto="Avisos y recordatorios"
      badgeTexto={noLeidas > 0 ? "Pendiente" : "Al día"}
      badgeTipo={noLeidas > 0 ? "alerta" : "positivo"}
      textoEstado={noLeidas > 0 ? "Por revisar" : "Al día"}
      enlaceTexto="Ver avisos"
      onClickEnlace={() => navigate("/notificaciones")}
    />
  );
};
