import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RutaProtegida } from "./modulos/auth/componentes/RutaProtegida";
import { LoginPagina } from "./modulos/auth/paginas/LoginPagina";
import { RegistroPagina } from "./modulos/auth/paginas/RegistroPagina";
import { Layout } from "./componentes/Layout";
import { DashboardInicio } from "./paginas/DashboardInicio";

/**
 * Componente para rutas públicas (login/registro):
 * Si el usuario ya está autenticado, lo redirige directamente al panel principal.
 */
const RutaPublica: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function RutasApp() {
  return (
    <Routes>
      {/* Rutas Públicas (Autenticación) */}
      <Route
        path="/login"
        element={
          <RutaPublica>
            <LoginPagina />
          </RutaPublica>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublica>
            <RegistroPagina />
          </RutaPublica>
        }
      />

      {/* Rutas Privadas / Protegidas */}
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardInicio />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RutasApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
