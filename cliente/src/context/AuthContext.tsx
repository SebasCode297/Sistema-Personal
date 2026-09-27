import React, { createContext, useContext, useState, useEffect } from "react";
import { authServicio } from "../modulos/auth/servicios/authServicio";
import type {
  Usuario,
  CredencialesLogin,
  DatosRegistro,
} from "../modulos/auth/servicios/authServicio";

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  cargando: boolean;
  login: (credenciales: CredencialesLogin) => Promise<void>;
  registro: (datos: DatosRegistro) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(authServicio.obtenerToken());
  const [cargando, setCargando] = useState<boolean>(true);

  // Al montar la app, verificamos si existe un token válido guardado
  useEffect(() => {
    async function inicializarSesion() {
      const tokenGuardado = authServicio.obtenerToken();
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }

      try {
        const respuesta = await authServicio.obtenerPerfil();
        if (respuesta.ok && respuesta.usuario) {
          setUsuario(respuesta.usuario);
          setToken(tokenGuardado);
        } else {
          authServicio.eliminarToken();
          setUsuario(null);
          setToken(null);
        }
      } catch {
        authServicio.eliminarToken();
        setUsuario(null);
        setToken(null);
      } finally {
        setCargando(false);
      }
    }

    inicializarSesion();
  }, []);

  async function login(credenciales: CredencialesLogin) {
    const respuesta = await authServicio.login(credenciales);
    authServicio.guardarToken(respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  }

  async function registro(datos: DatosRegistro) {
    const respuesta = await authServicio.registro(datos);
    authServicio.guardarToken(respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  }

  function logout() {
    authServicio.eliminarToken();
    setUsuario(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        estaAutenticado: !!usuario,
        cargando,
        login,
        registro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
