// src/components/Dashboard/AlertCard.tsx
import React from "react";
import {
  ExclamationTriangleIcon,
  BoltIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import type { Alert } from "../../pages/hook/useAlerts";

interface AlertCardProps {
  alert: Alert;
  onShowDetail: () => void;
  viewMode: "grid" | "list";
  
}

// Colores según score
const getScoreGradientColor = (score: number) => {
  if (score >= 90) return "text-red-600 bg-red-50 border-red-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-green-600 bg-green-50 border-green-200";
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onShowDetail,
  viewMode,
}) => {
  const formattedDate = new Date(alert.fecha_hora).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCriticalRisk = alert.alertScore >= 90;
  const priorityColor =
    alert.alertScore >= 90
      ? "border-l-red-600"
      : alert.alertScore >= 70
      ? "border-l-amber-500"
      : "border-l-green-500";

  const priorityIcon = isCriticalRisk ? (
    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
  ) : (
    <BoltIcon className="w-5 h-5 text-amber-500" />
  );

  const scoreClasses = getScoreGradientColor(alert.alertScore);

  // --- LIST VIEW ---
  if (viewMode === "list") {
    return (
      <div
        className={`group relative bg-white border border-gray-100 p-4 my-1 border-l-8 ${priorityColor} transition duration-300 ease-in-out hover:bg-gray-50 hover:shadow-md`}
      >
        <div className="grid grid-cols-12 items-center gap-4 text-sm font-medium">
          <div className="flex items-center space-x-3 col-span-3">
            <div className="p-1 rounded-full bg-gray-100">{priorityIcon}</div>
            <p className="text-base font-bold text-gray-800 truncate">
              Alerta <span className="text-cyan-600">#{alert.id}</span>
            </p>
          </div>

          <div className="col-span-3 hidden md:block">
            <p className="text-xs text-gray-500 uppercase">Cliente</p>
            <p className="font-semibold text-gray-700 truncate">
              {alert.cuenta}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase">Monto</p>
            <p className="font-mono font-extrabold text-red-700 text-base truncate">
              S/ {alert.monto_total}
            </p>
          </div>

          <div className="col-span-1 flex justify-center">
            <div
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${scoreClasses}`}
            >
              {alert.alertScore}
            </div>
          </div>

          <div className="col-span-2 hidden lg:block">
            <p className="text-xs text-gray-500 uppercase">Fecha</p>
            <p className="text-gray-700 font-mono text-xs">{formattedDate}</p>
          </div>

          <div className="col-span-1 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail();
              }}
              className="p-1.5 rounded-full text-cyan-600 hover:bg-cyan-100 transition"
              title="Ver Detalle"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-xl border-l-4 ${priorityColor} transition duration-300 hover:shadow-2xl flex flex-col space-y-4`}
    >
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          {priorityIcon}
          <h2 className="text-xl font-extrabold text-gray-800">
            Alerta <span className="text-cyan-600">#{alert.id}</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase">Cliente</p>
          <p className="font-semibold text-gray-700">{alert.cuenta}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Fecha</p>
          <p className="text-gray-700 font-mono">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Monto</p>
          <p className="font-mono font-extrabold text-red-700 text-2xl">
            S/ {alert.monto_total}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Nivel de Riesgo</p>
          <div
            className={`px-4 py-1 inline-block rounded-full font-mono font-extrabold text-2xl border-2 ${scoreClasses}`}
          >
            {alert.alertScore}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 pt-4 border-t">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetail();
        }}
        className="flex items-center justify-center gap-2 text-lg font-semibold text-red-700 bg-red-100 hover:bg-red-200 hover:text-red-800 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Ver Detalles
      </button>
    </div>
    </div>
  );
};
