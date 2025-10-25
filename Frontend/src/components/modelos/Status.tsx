import React from "react";
import { BadgeCheck, Brain, Database, Info, Layers } from "lucide-react";
import type { Metrics, ModelInfo } from "../../pages/hook/useModelos";

export const MetricTag: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = "text-blue-600" }) => (
  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className={`text-sm font-bold ${color}`}>{(value * 100).toFixed(1)}%</span>
  </div>
);

export const DatasetBadge: React.FC<{ name: string; rows: number; onClick?: () => void }> = ({ name, rows, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
    <Database className="w-4 h-4 text-blue-600" />
    <span className="text-xs text-gray-600">{name}</span>
    <span className="text-xs font-semibold text-gray-800">{rows} filas</span>
  </button>
);

export const ModelStatusCard: React.FC<{
  model: ModelInfo;
  metrics: Metrics;
}> = ({ model, metrics }) => {
  const statusColor = model.status === "Activo" ? "bg-green-100 text-green-700 border-green-200"
    : model.status === "Entrenamiento" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-green-600/90 p-3 rounded-xl shadow-inner">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{model.name}_{model.version}</h2>
          <p className="text-sm text-gray-500">Framework: {model.framework}</p>
          <p className="text-xs text-gray-400">Último entrenamiento: {model.lastTrainingDate}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor}`}>
          <BadgeCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">{model.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <MetricTag label="Accuracy" value={metrics.accuracy} />
        <MetricTag label="Precision" value={metrics.precision} />
        <MetricTag label="Recall" value={metrics.recall} />
        <MetricTag label="F1" value={metrics.f1} />
        <MetricTag label="AUC-ROC" value={metrics.aucRoc} color="text-purple-700" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-600">Modelo actual listo para inferencia en producción.</span>
        <Info className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default ModelStatusCard;