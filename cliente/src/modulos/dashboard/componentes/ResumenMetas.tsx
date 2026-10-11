import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { metasServicio } from "../../metas/servicios/metasServicio";

export const ResumenMetas: React.FC = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await metasServicio.resumenMetas();
        if (res.ok) setTotal(parseInt(res.resumen.total));
      } catch {
        setTotal(0);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <TarjetaMetrica
      etiqueta="Metas"
      valor={cargando ? "Cargando..." : `${total} registrada${total !== 1 ? "s" : ""}`}
      subtexto="Objetivos personales"
      badgeTexto="Activo"
      badgeTipo="positivo"
      textoEstado="En curso"
      enlaceTexto="Ver metas"
      onClickEnlace={() => navigate("/metas")}
    />
  );
};
