import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Metrics } from "../../pages/hook/useModelos";

export const ModelComparisonTable: React.FC<{ prev: Metrics; curr: Metrics }> = ({
  prev,
  curr,
}) => {
  const rows = [
    { label: "Accuracy", prev: prev.accuracy, curr: curr.accuracy, icon: <CheckBadgeIcon className="w-4 h-4 text-green-600" /> },
    { label: "Precision", prev: prev.precision, curr: curr.precision, icon: <ChartPieIcon className="w-4 h-4 text-green-600" /> },
    { label: "Recall", prev: prev.recall, curr: curr.recall, icon: <CursorArrowRaysIcon className="w-4 h-4 text-green-600" /> },
    { label: "F1", prev: prev.f1, curr: prev.f1, icon: <SparklesIcon className="w-4 h-4 text-green-600" /> },
    { label: "AUC-ROC", prev: prev.aucRoc, curr: curr.aucRoc, icon: <ChartBarIcon className="w-4 h-4 text-green-600" /> },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {["Métrica", "Modelo anterior", "Nuevo modelo", "Δ"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((r) => {
            const diff = r.curr - r.prev;
            const improved = diff >= 0;

            return (
              <tr key={r.label} className="text-sm hover:bg-gray-50 transition">
                <td className="px-3 py-2 text-gray-800 font-medium flex items-center gap-2">
                  {r.icon} {r.label}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(r.prev * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-gray-800 font-semibold">
                  {(r.curr * 100).toFixed(2)}%
                </td>
                <td
                  className={`px-3 py-2 font-bold flex items-center gap-1 ${
                    improved ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {improved ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  {diff >= 0 ? "+" : ""}
                  {(diff * 100).toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ModelComparisonTable;
