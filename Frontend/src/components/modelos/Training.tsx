import React from "react";
import Button from "../common/Button";
import { Play, Upload, Settings2 } from "lucide-react";
import type { ModelType, RegressionPoint } from "../../pages/hook/useModelos";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import {
  CommandLineIcon,
} from "@heroicons/react/24/outline";

// VISUALIZADOR DE LOGS
export const TrainingLogsViewer: React.FC<{ logs: string[] }> = ({ logs }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 h-full min-h-40 font-mono text-xs text-gray-700">
    <div className="flex items-center gap-2 mb-2">
      <CommandLineIcon className="w-4 h-4 text-green-600" /> 
      <span className="text-gray-600 font-semibold">Consola</span>
    </div>

    <div
      className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{
        maxHeight: "25em",
        lineHeight: "1.05em",
      }}
    >
      {logs.length === 0 ? (
        <div className="text-gray-400">Sin registros</div>
      ) : (
        logs.map((l, i) => (
          <div key={i} className="py-0.5 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                l.includes("⚠️")
                  ? "bg-yellow-400"
                  : l.includes("❌")
                  ? "bg-red-400"
                  : "bg-green-500"
              }`}
            />
            <span className="text-gray-800">{l}</span>
          </div>
        ))
      )}
    </div>
  </div>
);
// BARRA DE PROGRESO
export const TrainingProgressBar: React.FC<{
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
}> = ({ progress, currentEpoch, totalEpochs }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-600">Progreso de entrenamiento</span>
      <span className="text-xs font-semibold text-gray-800">{progress}%</span>
    </div>
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-3 bg-blue-600 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="mt-1 text-xs text-gray-500">
      Epoch {currentEpoch} / {totalEpochs}
    </div>
  </div>
);


// BOTÓN DE EXPORTACIÓN
export const ExportModelButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => (
  <Button variant="secondary" onClick={onClick} disabled={disabled} className="w-full bg-green-600 hover:bg-green-700 text-white">
    <Upload className="w-4 h-4" />
    Exportar resultados a PostgreSQL
  </Button>
);


// GRÁFICO DE MÉTRICAS DE ENTRENAMIENTO
export const RegressionLineChart: React.FC<{ data: RegressionPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-400 text-sm">
        No hay datos de entrenamiento aún.
      </div>
    );
  }

  // Calcular promedio móvil de la pérdida
  const movingAverage = (arr: number[], windowSize: number) =>
    arr.map((_, i) => {
      const start = Math.max(0, i - windowSize + 1);
      const window = arr.slice(start, i + 1);
      return window.reduce((a, b) => a + b, 0) / window.length;
    });

  const dataWithMA = data.map((point, i) => ({
    ...point,
    movingAvg: movingAverage(data.map((d) => d.loss ?? 0), 5)[i],
  }));

  const [showLoss, setShowLoss] = React.useState(true);
  const [showAccuracy, setShowAccuracy] = React.useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <h4 className="text-sm font-semibold mb-2 text-gray-800">
        Métricas de entrenamiento
      </h4>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-600">Métricas</span>
        <button onClick={() => setShowLoss((v) => !v)} className={`px-2 py-1 text-xs rounded border ${showLoss ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-gray-100 text-gray-600 border-gray-200"}`}>Loss</button>
        <button onClick={() => setShowAccuracy((v) => !v)} className={`px-2 py-1 text-xs rounded border ${showAccuracy ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-200"}`}>Accuracy</button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataWithMA} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="epoch"
              label={{
                value: "Época",
                position: "insideBottom",
                offset: -5,
                fill: "#6b7280",
              }}
              tick={{ fill: "#4b5563", fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Valor métrico",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
              }}
              tick={{ fill: "#4b5563", fontSize: 12 }}
              domain={[0, "auto"]}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                const items = payload.filter(Boolean);
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs">
                    <div className="text-gray-600 mb-1">Época {label}</div>
                    {items.map((it: any) => {
                      const key = it.dataKey;
                      const name = key === "loss" ? "Pérdida (Loss)" : key === "accuracy" ? "Precisión" : "Promedio móvil";
                      const color = it.color || "#999";
                      const val = Number(it.value).toFixed(2);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-gray-700">{name}:</span>
                          <span className="font-semibold text-gray-900">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend verticalAlign="bottom" height={28} wrapperStyle={{ transform: "translateY(25px)"}} />

            {/* Pérdida */}
            {showLoss && (
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#2563eb"
                strokeWidth={2.5}
                name="Pérdida (Loss)"
                dot={false}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            )}

            {/* Precisión */}
            {data.some((d) => d.accuracy !== undefined) && showAccuracy && (
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#16a34a"
                strokeWidth={2}
                name="Precisión"
                dot={false}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}

            {/* Promedio móvil */}
            {dataWithMA.some((d) => (d as any).movingAvg !== undefined) && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Promedio móvil"
                dot={false}
                isAnimationActive
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


// NUEVO GRÁFICO: PREDICCIÓN VS VALOR REAL
export const PredictedVsRealChart: React.FC<{
  data: { real: number; predicted: number }[];
}> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-400 text-sm">
        No hay datos de predicción disponibles.
      </div>
    );
  }

  // 🔹 Asegurar que los datos estén ordenados por el valor real
  const sortedData = [...data].sort((a, b) => a.real - b.real);

  // 🔹 Calcular la línea de tendencia (mínimos cuadrados)
  const n = sortedData.length;
  const sumX = sortedData.reduce((acc, d) => acc + d.real, 0);
  const sumY = sortedData.reduce((acc, d) => acc + d.predicted, 0);
  const sumXY = sortedData.reduce((acc, d) => acc + d.real * d.predicted, 0);
  const sumX2 = sortedData.reduce((acc, d) => acc + d.real * d.real, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = sumY / n - slope * (sumX / n);

  const minX = Math.min(...sortedData.map((d) => d.real));
  const maxX = Math.max(...sortedData.map((d) => d.real));
  const trendLine = [
    { real: minX, predicted: slope * minX + intercept },
    { real: maxX, predicted: slope * maxX + intercept },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <h4 className="text-sm font-semibold mb-4 text-gray-800">
        Valor predicho vs Valor real
      </h4>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="real"
              type="number"
              name="Real"
              label={{
                value: "Real",
                position: "insideBottom",
                offset: -5,
                fill: "#6b7280",
              }}
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fill: "#4b5563", fontSize: 12 }}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />
            <YAxis
              dataKey="predicted"
              type="number"
              name="Predicción"
              label={{
                value: "Predicción",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
              }}
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fill: "#4b5563", fontSize: 12 }}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;

                const p: any = payload[0];
                const real = Number(p.payload.real).toFixed(2);
                const pred = Number(p.payload.predicted).toFixed(2);

                // Definimos los "ítems" para reutilizar el formato
                const items = [
                  { name: "Valor Real", value: real, color: "#3b82f6" },     // azul
                  { name: "Valor Predicho", value: pred, color: "#fbbf24" }, // amarillo
                ];

                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow-lg">
                    <div className="text-gray-600 mb-1">Datos del punto</div>
                    {items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: it.color }}
                        />
                        <span className="text-gray-700">{it.name}:</span>
                        <span className="font-semibold text-gray-900">{it.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {/* Puntos de dispersión */}
            <Scatter name="Datos" data={sortedData} fill="#60a5fa" opacity={0.8} />

            {/* Línea de identidad (Predicción = Real) */}
            <ReferenceLine
              segment={[
                { x: minX, y: minX },
                { x: maxX, y: maxX },
              ]}
              stroke="#000"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />

            {/* Línea de tendencia */}
            <Line
              type="linear"
              dataKey="predicted"
              data={trendLine}
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              name="Tendencia"
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ transform: "translateY(25px)" }}
              content={() => (
                <ul style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
                  <li style={{ color: "#60a5fa" }}>● Real</li>
                  <li style={{ color: "#fbbf24" }}>— Tendencia</li>
                  <li style={{ color: "#000" }}>— Predicho</li>
                </ul>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// FORMULARIO DE ENTRENAMIENTO
export const TrainingForm: React.FC<{
  epochs: number;
  setEpochs: (n: number) => void;
  modelType: ModelType;
  setModelType: (t: ModelType) => void;
  onStart: () => void;
  disabled?: boolean;
  isTraining?: boolean;
}> = ({
  epochs,
  setEpochs,
  modelType,
  setModelType,
  onStart,
  disabled = false,
  isTraining = false,
}) => (
  <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-3">
      <Settings2 className="w-5 h-5 text-blue-600" />
      <h3 className="text-sm font-semibold">Parámetros de entrenamiento</h3>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-600">Epochs</label>
        <input
          type="number"
          value={epochs}
          min={1}
          max={250}
          onChange={(e) => setEpochs(parseInt(e.target.value || "0"))}
          className="w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600">Tipo de modelo</label>
        <select
          value={modelType}
          onChange={(e) => setModelType(e.target.value as ModelType)}
          className="w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        >
          <option>PyTorch</option>
          <option>scikit-learn</option>
        </select>
      </div>
    </div>

    <div className="mt-4">
      <Button
        onClick={onStart}
        disabled={disabled || isTraining}
        className="w-full bg-green-100 hover:bg-green-50 text-black"
      >
        <Play className="w-4 h-4" />
        {isTraining ? "Entrenando..." : "Entrenar nuevo modelo"}
      </Button>
    </div>
  </div>
);

export default TrainingForm;
