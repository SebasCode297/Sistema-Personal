import React from "react";

export interface TarjetaMetricaProps {
  etiqueta: string;
  valor: string;
  subtexto: string;
  badgeTexto?: string;
  badgeTipo?: "positivo" | "alerta" | "normal";
  textoEstado: string;
  enlaceTexto?: string;
  onClickEnlace?: () => void;
}

export const TarjetaMetrica: React.FC<TarjetaMetricaProps> = ({
  etiqueta,
  valor,
  subtexto,
  badgeTexto,
  badgeTipo = "normal",
  textoEstado,
  enlaceTexto,
  onClickEnlace,
}) => {
  return (
    <article className="tarjeta-metrica">
      <div className="tarjeta-metrica-superior">
        <span className="tarjeta-metrica-etiqueta">{etiqueta}</span>
        {badgeTexto && (
          <span className={`tarjeta-metrica-badge ${badgeTipo}`}>
            {badgeTexto}
          </span>
        )}
      </div>

      <div className="tarjeta-metrica-cuerpo">
        <div className="tarjeta-metrica-valor">{valor}</div>
        <p className="tarjeta-metrica-subtexto">{subtexto}</p>
      </div>

      <div className="tarjeta-metrica-footer">
        <span className="tarjeta-metrica-estado">{textoEstado}</span>
        {enlaceTexto && (
          <button
            type="button"
            className="tarjeta-metrica-enlace"
            style={{
              background: "transparent",
              border: "none",
              padding: "0",
              minHeight: "auto",
              cursor: onClickEnlace ? "pointer" : "default",
            }}
            onClick={onClickEnlace}
          >
            {enlaceTexto}
          </button>
        )}
      </div>
    </article>
  );
};
