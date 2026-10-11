import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RutaProtegida } from "./modulos/auth/componentes/RutaProtegida";
import { LoginPagina } from "./modulos/auth/paginas/LoginPagina";
import { RegistroPagina } from "./modulos/auth/paginas/RegistroPagina";
import { Layout } from "./componentes/Layout";
import { DashboardPagina } from "./modulos/dashboard/paginas/DashboardPagina";
import { TareasPagina } from "./modulos/tareas/paginas/TareasPagina";
import { MetasPagina } from "./modulos/metas/paginas/MetasPagina";
import { NotificacionesPagina } from "./modulos/notificaciones/paginas/NotificacionesPagina";
import { PerfilPagina } from "./modulos/perfil/paginas/PerfilPagina";

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

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPagina />} />
          <Route path="/tareas" element={<TareasPagina />} />
          <Route path="/metas" element={<MetasPagina />} />
          <Route path="/notificaciones" element={<NotificacionesPagina />} />
          <Route path="/perfil" element={<PerfilPagina />} />
          {/* Finanzas y Calendario eliminados */}
        </Route>
      </Route>

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
