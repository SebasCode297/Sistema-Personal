import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { metasServicio } from "../../metas/servicios/metasServicio";

export const ResumenMetas: React.FC = () => {
  const navigate = useNavigate();
  const [activas, setActivas] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await metasServicio.resumenMetas();
        if (res.ok) setActivas(parseInt(res.resumen.activas));
      } catch {
        setActivas(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Metas"
      valor={cargando ? "Cargando..." : `${activas} activa${activas !== 1 ? "s" : ""}`}
      subtexto="Objetivos en seguimiento"
      badgeTexto="Activo"
      badgeTipo="positivo"
      textoEstado="Módulo activo"
      enlaceTexto="Ver metas"
      onClickEnlace={() => navigate("/metas")}
    />
  );
};
