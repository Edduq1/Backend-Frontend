import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

type MainLayoutProps = {
  onLogout: () => void;
};

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onLogout={onLogout}
      />

      {/* Contenido principal */}
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out
          ${collapsed ? "ml-[7rem]" : "ml-[16rem]"} 
        `}
      >
        {/*Contenido dinámico */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4">
          {/* Header dentro del contenido */}
          <Header />

          {/* Vista actual */}
          <Outlet />

          {/* Footer dentro del contenido */}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
