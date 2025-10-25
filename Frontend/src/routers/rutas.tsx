import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/ui/LoginScreen";
import DashboardLayout from "../layouts/MainLayout";
import Dashboard from "../pages/ui/Dashboard";
import Transacciones from "../pages/ui/TransactionExplorer";
import Alertas from "../pages/ui/AlertasImport";
import Modelos from "../pages/ui/Modelos";
import Configuracion from "../pages/ui/Configuracion";
import Perfil from "../pages/ui/Perfil";

interface RutasProps {
  isAuthenticated: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => void;
}

const Rutas: React.FC<RutasProps> = ({ isAuthenticated, onLogin, onLogout }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={onLogin} />
          )
        }
      />
      
      {/* Rutas protegidas del Dashboard */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardLayout onLogout={onLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transacciones" element={<Transacciones />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="modelos" element={<Modelos />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      
      {/* Ruta de fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Rutas;