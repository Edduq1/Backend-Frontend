import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { dummyUser } from "../hook/usePerfil";
import type { UserProfile } from "../hook/usePerfil";

import KPICard from "../../components/perfil/KPICard";
import MiniCalendarModal from "../../components/perfil/MiniCalendar";
import RealTimeClockWidget from "../../components/perfil/RealTimeClockWidget";
import UserProfileCard from "../../components/perfil/UserProfileCard";
import Pendientes from "../../components/perfil/Pendientes";
import InfoAdminCard from "../../components/perfil/InfoAdminCard";

import {
  ChartBarIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

const PerfilPage: React.FC = () => {
  const [user] = useState<UserProfile>(dummyUser);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [fechasConTareas, setFechasConTareas] = useState<string[]>([]);
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setMostrarTodos(false); // Desactiva "Mostrar Todo" al seleccionar una fecha
    setCalendarOpen(false); // Cierra el modal al seleccionar
    console.log(" Fecha seleccionada:", date);
  }, []);
const handleMostrarTodos = useCallback(() => {
    setSelectedDate(null); // Borra la fecha seleccionada
    setMostrarTodos(true); // Activa el modo "Mostrar Todo"
  }, []);
  
  // 3. Obtiene las fechas con pendientes desde Pendientes.tsx
  const handleTareasChange = useCallback((fechas: string[]) => {
    setFechasConTareas(fechas); // Almacena las fechas para el calendario
  }, []);
  return (
    <motion.div
      className="min-h-screen bg-white-50 p-6 sm:p-10 font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* HEADER */}
      <div className="relative mb-10 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 text-white rounded-3xl shadow-xl p-6 flex flex-col sm:flex-row justify-between items-center overflow-hidden">
        {/* Nombre y descripción */}
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">
            <UserCircleIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
              Panel de Administrador
            </h1>
            <p className="text-purple-200 font-medium mt-1">
              Supervisión general y control del sistema
            </p>
          </div>
        </div>

        {/* Reloj + Calendario */}
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
            <RealTimeClockWidget />
          </div>
            <button
            onClick={() => setCalendarOpen(true)}
            className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition"
            title="Abrir calendario"
          >
            <CalendarDaysIcon className="h-7 w-7 text-white" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-10 border border-purple-100"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-purple-600" />
          Rendimiento y Métricas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Alertas Revisadas"
            value={user.alertsReviewed}
            icon={<ChartBarIcon className="h-6 w-6" />}
            description="Últimos 30 días"
            colorClass="text-purple-600 bg-purple-100"
          />
          <KPICard
            title="Tasa de Acierto"
            value={`${(1 - user.tasaError) * 100}%`}
            icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
            description="Precisión de decisiones"
            colorClass="text-green-600 bg-green-100"
          />
          <KPICard
            title="Alertas Activas"
            value={user.openAssignments}
            icon={<BellIcon className="h-6 w-6" />}
            description="Asignadas a mí"
            colorClass="text-rose-600 bg-rose-100"
          />
        </div>
      </motion.div>

      {/* PERFIL Y BLOQUES ADICIONALES */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10"
      >
        {/* Columna lateral: perfil*/}
        <div className="flex flex-col gap-10 lg:col-span-1">
          <UserProfileCard user={user} />
        </div>

        {/* Columna principal: información y novedades */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <InfoAdminCard />
        </div>
      </motion.div>
{/* PENDIENTES AL 100% DE ANCHO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-10"
      >
        <Pendientes 
          selectedDate={selectedDate} // Fecha seleccionada para filtrar
          mostrarTodos={mostrarTodos} // Indica si se debe ignorar la fecha
          onMostrarTodos={handleMostrarTodos} // Callback para el botón "Mostrar Todo"
          onTareasChange={handleTareasChange} // Callback para obtener las fechas con puntos
        />
      </motion.div>
      {/* MODAL DEL CALENDARIO */}
      <MiniCalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onDateChange={handleDateChange}
        tareasConFecha={fechasConTareas}
      />
    </motion.div>
  );
};

export default PerfilPage;
