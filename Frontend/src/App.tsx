import React from "react";
import { useAuth } from "./auth/AuthContext";
import Rutas from "./routers/rutas";
const App: React.FC = () => {
const { isAuthenticated, login, logout } = useAuth();
  return (
    <Rutas
      isAuthenticated={isAuthenticated}
      onLogin={login}
      onLogout={logout}
    />
  );
};

export default App;
