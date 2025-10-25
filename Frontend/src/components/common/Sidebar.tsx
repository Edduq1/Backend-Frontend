import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "../../assets/icons/DashboardIcon";
import TransactionsIcon from "../../assets/icons/TransactionsIcon";
import AlertsIcon from "../../assets/icons/AlertsIcon";
import ModelsIcon from "../../assets/icons/ModelsIcon";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import MenuIcon from "../../assets/icons/MenuIcon";
import ProfileIcon from "../../assets/icons/ProfileIcon";
import LogoutIcon from "../../assets/icons/LogoutIcon";
import ConfirmationModal from "./ConfirmationModal";

const fontStyle: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export type SidebarPageKey =
  | "dashboard"
  | "transacciones"
  | "alertas"
  | "modelos"
  | "configuracion"
  | "perfil";

type SidebarProps = {
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  onLogout: () => void;
};

type Item = {
  key: SidebarPageKey;
  label: string;
  Icon: React.FC<{ className?: string }>;
};

const NAV_ITEMS: Item[] = [
  { key: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "transacciones", label: "Transacciones", Icon: TransactionsIcon },
  { key: "alertas", label: "Alertas", Icon: AlertsIcon },
  { key: "modelos", label: "Modelos", Icon: ModelsIcon },
  { key: "configuracion", label: "Configuración", Icon: SettingsIcon },
];

// --- Componente de ítem ---
const SidebarItem: React.FC<{
  item: Item;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  fixedIconSize?: string;
}> = ({ item, active, collapsed, onClick, fixedIconSize }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 w-full rounded-md px-4 py-3 h-12 transition-colors duration-200 ${
        active ? "bg-[#0B1A34]" : "hover:bg-[#333B50]"
      }`}
      style={fontStyle}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={`${
          active ? "text-[#007BFF]" : "text-[#F7F9FC]"
        } transition-transform duration-200 group-hover:scale-110`}
      >
        <item.Icon
          className={`${
            fixedIconSize ? fixedIconSize : collapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
      </span>
      <span
        className={`text-[15px] font-medium whitespace-nowrap ${
          active ? "text-[#007BFF]" : "text-[#F7F9FC]"
        } transition-opacity duration-200 ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
};

// --- Sidebar principal ---
const Sidebar: React.FC<SidebarProps> = ({
  collapsed: collapsedProp,
  onCollapsedChange,
  onLogout,
}) => {
  const [collapsedState, setCollapsedState] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const collapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : collapsedState;

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Mapeo ruta → key
  const routeToKey: Record<string, SidebarPageKey> = {
    "/dashboard": "dashboard",
    "/dashboard/transacciones": "transacciones",
    "/dashboard/alertas": "alertas",
    "/dashboard/modelos": "modelos",
    "/dashboard/configuracion": "configuracion",
    "/dashboard/perfil": "perfil",
  };

  // 🔹 Detectar página actual según la ruta
  const currentKey = routeToKey[location.pathname] || "dashboard";

  const toggleSidebar = () => {
    const next = !collapsed;
    if (typeof collapsedProp !== "boolean") setCollapsedState(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside
      className={`h-screen bg-[#1A2338] text-white transition-all duration-300 ${
        collapsed ? "w-28" : "w-64"
      } fixed left-0 top-0 flex flex-col border-r border-[#333B50] overflow-x-hidden box-border`}
      style={fontStyle}
    >
      {/* --- Header / Logo / Toggle --- */}
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-[#333B50]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => collapsed && toggleSidebar()}
            className="shrink-0 rounded-md overflow-hidden"
            title="Logo"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className={`${collapsed ? "w-20 h-20" : "w-12 h-12"} object-contain`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </button>
          {!collapsed && (
            <div className="flex flex-col group">
              <span className="text-base leading-tight text-[#F7F9FC] font-semibold transition-colors group-hover:text-[#FD993B] group-hover:[text-shadow:0_0_8px_#FD993B]">
                Banco Detector <br /> del Perú
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="rounded-md p-2 hover:bg-[#333B50] transition-colors"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <span className="text-[#F7F9FC]">
              <MenuIcon className="w-6 h-6" />
            </span>
          </button>
        )}
      </div>

      {/* --- Navegación principal --- */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.key} className="transition-transform duration-200">
              <SidebarItem
                item={item}
                active={currentKey === item.key}
                collapsed={collapsed}
                onClick={() =>
                  navigate(`/dashboard/${item.key === "dashboard" ? "" : item.key}`)
                }
                fixedIconSize="w-6 h-6"
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* --- Sección inferior: Perfil / Logout --- */}
      <div className="px-3 py-3 border-t border-[#333B50]">
        <ul className="space-y-2">
          <li>
            <SidebarItem
              item={{ key: "perfil", label: "Perfil", Icon: ProfileIcon }}
              active={currentKey === "perfil"}
              collapsed={collapsed}
              onClick={() => navigate("/dashboard/perfil")}
              fixedIconSize="w-6 h-6"
            />
          </li>

          <li>
            <button
              onClick={() => setLogoutOpen(true)}
              className="group flex items-center gap-4 w-full rounded-md px-4 py-3 transition-colors duration-200 hover:bg-[#333B50]"
              style={fontStyle}
            >
              <span className="text-[#F7F9FC] transition-transform duration-200 group-hover:scale-110">
                <LogoutIcon className="w-6 h-6" />
              </span>
              <span
                className={`text-[15px] font-medium text-[#F7F9FC] transition-all duration-200 ${
                  collapsed
                    ? "opacity-0 translate-x-2 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                Cerrar sesión
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* --- Modal de confirmación para cerrar sesión --- */}
      <ConfirmationModal
        open={logoutOpen}
        title="Cerrar sesión"
        description="¿Seguro que deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
