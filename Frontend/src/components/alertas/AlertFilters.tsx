import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import type { AlertFilters as AlertFiltersType } from "../../pages/hook/useAlerts";

interface AlertFiltersProps {
  currentFilters: AlertFiltersType;
  onFilterChange: (filters: AlertFiltersType) => void;
  highScore: number; // ✅ agregado para el prop highScore
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  currentFilters,
  onFilterChange,
  highScore, // ✅ aunque no lo uses directamente, lo recibes para evitar el error
}) => {
  const handleRiskLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // ✅ convertir el string del select al tipo correcto
    onFilterChange({
      ...currentFilters,
      riskLevel: e.target.value as "" | "low" | "medium" | "high",
    });
  };

  const riskOptions = [
    { value: "", label: "Todos los niveles" },
    { value: "low", label: "🟢 Bajo (0-49)" },
    { value: "medium", label: "🟡 Medio (50-79)" },
    { value: "high", label: `🔴 Alto (${highScore}+ )` },
  ];

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100 items-end">
      <div className="flex items-center text-lg font-bold text-red-700 p-2 bg-red-50 rounded-lg">
        <FunnelIcon className="w-5 h-5 mr-2" />
        Filtros por Nivel de Riesgo
      </div>

      <div className="min-w-[180px] flex-grow max-w-sm">
        <label className="block text-xs text-gray-500 mb-1">
          Filtrar por Riesgo
        </label>
        <select
          value={currentFilters.riskLevel || ""}
          onChange={handleRiskLevelChange}
          className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-red-500 focus:border-red-500"
        >
          {riskOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
