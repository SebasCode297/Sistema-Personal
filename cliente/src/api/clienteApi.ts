const URL_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(mensaje: string, status: number, data?: any) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Cliente HTTP unificado para interactuar con la API REST de MiPanel.
 * Adjunta automáticamente el token JWT almacenado en localStorage si existe.
 */
export async function clienteApi<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("mipanel_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opciones.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${URL_BASE}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;

  const respuesta = await fetch(url, {
    ...opciones,
    headers,
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje = datos.mensaje || `Error en la petición: ${respuesta.status} ${respuesta.statusText}`;
    throw new ApiError(mensaje, respuesta.status, datos);
  }

  return datos as T;
}
