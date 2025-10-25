import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Bell, ChevronDown } from "lucide-react";
import { dummyUser, type UserProfile } from "../../pages/hook/usePerfil";

const Header: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const user: UserProfile = dummyUser; // TODO: reemplazar con usuario real cuando exista auth global

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeString = useMemo(() => {
    return now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, [now]);

  const isDay = useMemo(() => {
    const h = now.getHours();
    return h >= 6 && h < 19; // día entre 06:00 y 18:59
  }, [now]);

  const imageUrl = useMemo(() => {
    const stored = localStorage.getItem(`profileImage_${user.idUsuario}`);
    return (
      stored ||
      user.profileImageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=E0F2FE&color=1D4ED8&bold=true`
    );
  }, [user.idUsuario, user.profileImageUrl, user.nombre]);

  return (
    <div className="sticky top-5 z-30">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm px-4 py-2 flex items-center justify-between">
        {/* Izquierda: hora + icono día/noche */}
        <div className="flex items-center gap-2">
          {isDay ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-500" />
          )}
          <span className="font-mono text-sm sm:text-base text-gray-700">{timeString}</span>
        </div>

        {/* Derecha: notificaciones + usuario */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] rounded-full px-1 leading-4">3</span>
          </button>

          <Link to="/dashboard/perfil" className="flex items-center gap-3 group">
            <img
              src={imageUrl}
              alt={user.nombre}
              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 leading-4">{user.nombre}</span>
              <span className="text-xs text-gray-500">Perfil</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;