import React from "react";
import { 
  XMarkIcon, 
  BoltIcon, 
  MapPinIcon, 
  UserCircleIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import {motion} from "framer-motion";

interface AlertDetalleProps {
  alert: Alert;
  onClose: () => void;
  // Opcional: Si tienes una función para cambiar el estado desde el modal
  onStatusChange?: (alertId: number, newStatus: "OPEN" | "CLOSED") => void; 
}

// 1. Funciones auxiliares para el diseño
const getStatusColor = (status: Alert["status"]) => {
  return status === "OPEN" ? "bg-red-600" : "bg-green-600";
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-red-700 bg-red-100 border-red-300";
  if (score >= 70) return "text-amber-700 bg-amber-100 border-amber-300";
  return "text-cyan-700 bg-cyan-100 border-cyan-300";
};

 type Alert = {
   id: number;
   alertScore: number;
   status: 'OPEN' | 'CLOSED';
   cuenta: string;
   monto_total: number;
   pais: string;
   tipo_comercio: string;
   fecha_hora: string;
   factors: string[];
   // Nuevos campos informativos simulados:
   ip_origen?: string; 
   id_transaccion?: string;
   usuario_afectado?: string;
   descripcion_corta?: string;
 };

const AlertDetalle: React.FC<AlertDetalleProps> = ({ alert, onClose, onStatusChange }) => {
  
  const formattedDate = new Date(alert.fecha_hora).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const scoreClasses = getScoreColor(alert.alertScore);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.35,
          }}
          exit={{
    opacity: 0,
    y: 80,
    transition: {
      duration: 0.18, // ⚡ salida más rápida
      ease: "easeInOut",
    },
  }}
          className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-8 relative"
        >        
        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        {/* CABECERA Y METRICAS CLAVE */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Alerta <span className="text-red-700">#{alert.id}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Revisión detallada de evento de riesgo potencial.
          </p>
        </div>

        {/* SECTION 1: METRICAS DE RIESGO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 border p-4 rounded-lg bg-gray-50">
            {/* Score de Riesgo */}
            <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-600 uppercase">Nivel de Riesgo</p>
                <div className={`mt-1 px-3 py-1 inline-block rounded-full font-mono font-extrabold text-2xl border-2 ${scoreClasses} w-min`}>
                    {alert.alertScore}
                </div>
            </div>

            {/* Monto Total */}
            <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-600 uppercase">Monto Total</p>
                <div className="flex items-center space-x-2 mt-1">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                    <p className="font-mono font-extrabold text-2xl text-red-700">S/ {alert.monto_total}</p>
                </div>
            </div>
            
            {/* Estado */}
            <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-600 uppercase">Estado</p>
                <span
                    className={`mt-1 px-3 py-1 text-sm font-bold rounded-full uppercase text-white ${getStatusColor(alert.status)} w-min`}
                >
                    {alert.status}
                </span>
            </div>

            {/* Fecha y Hora */}
            <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-600 uppercase">Fecha y Hora</p>
                <p className="font-mono text-base text-gray-700 mt-1">{formattedDate}</p>
            </div>
        </div>
        
        {/* SECTION 2: DATOS DE CONTEXTO */}
        <h3 className="text-xl font-bold text-gray-700 mb-3">Contexto de la Transacción</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
            
            {/* Cliente (Afectado) */}
            <div>
              <p className="text-gray-500 font-medium flex items-center space-x-1"><UserCircleIcon className="w-4 h-4"/> <span>Cliente</span></p>
              <p className="font-bold text-gray-800">{alert.cuenta}</p>
            </div>
            
            {/* ID de Transacción (Añadido para trazabilidad) */}
            <div>
              <p className="text-gray-500 font-medium">ID Transacción</p>
              <p className="font-mono text-gray-800">{alert.id_transaccion || 'N/A'}</p>
            </div>

            {/* Tipo de Comercio */}
            <div>
              <p className="text-gray-500 font-medium">Tipo de Comercio</p>
              <p className="font-bold text-gray-800">{alert.tipo_comercio}</p>
            </div>
            
            {/* País */}
            <div>
              <p className="text-gray-500 font-medium flex items-center space-x-1"><MapPinIcon className="w-4 h-4"/> <span>País de Origen</span></p>
              <p className="text-gray-800">{alert.pais}</p>
            </div>

            {/* IP de Origen (Añadido para Geografía) */}
            <div>
              <p className="text-gray-500 font-medium">IP de Origen</p>
              <p className="font-mono text-gray-800">{alert.ip_origen || 'Desconocida'}</p>
            </div>
            
            {/* Usuario Afectado (Si aplica) */}
            <div>
              <p className="text-gray-500 font-medium">Usuario Afectado</p>
              <p className="font-mono text-gray-800">{alert.usuario_afectado || alert.cuenta}</p>
            </div>
        </div>

        {/* SECTION 3: FACTORES DE RIESGO */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center space-x-2">
            <BoltIcon className="w-6 h-6 text-amber-500"/>
            <span>Factores de Riesgo Detallados:</span>
          </h3>
          
          {/* Descripción Corta del Riesgo (Simulada) */}
          {alert.descripcion_corta && (
            <p className="text-base italic text-gray-600 mb-4 border-l-4 border-amber-300 pl-3">
                "{alert.descripcion_corta}"
            </p>
          )}

          {/* Lista de Factores */}
          <ul className="space-y-2 text-gray-700">
            {alert.factors.map((f, i) => (
              <li key={i} className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg shadow-sm">
                <span className="text-red-600 font-extrabold text-lg leading-none">-</span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* PIE DE PÁGINA Y ACCIONES */}
        <div className="mt-8 text-right flex justify-end space-x-4 border-t pt-4">
            {/* Botón de Cambio de Estado (Opcional) */}
            {onStatusChange && (
                <button
                    onClick={() => onStatusChange(alert.id, alert.status === "OPEN" ? "CLOSED" : "OPEN")}
                    className={`px-4 py-2 rounded-lg transition hover:shadow-lg
                        ${alert.status === "OPEN" 
                            ? "bg-green-600 text-white hover:bg-green-700" 
                            : "bg-red-600 text-white hover:bg-red-700"}`
                    }
                >
                    {alert.status === "OPEN" ? "Marcar como Cerrada" : "Reabrir Alerta"}
                </button>
            )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cerrar Vista
          </button>
        </div> 
      </motion.div>
    </div>
  );
};

export default AlertDetalle;
