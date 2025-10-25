import { useMemo, useRef, useState } from "react";
import { PRIMARY_COLOR } from "./useDashboard";

export type ModelStatus = "Activo" | "Entrenamiento" | "Error";
export type ModelType = "PyTorch" | "scikit-learn";

export interface ModelInfo {
  name: string;
  version: string;
  framework: ModelType;
  lastTrainingDate: string;
  status: ModelStatus;
}

export interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  aucRoc: number;
}

export interface DetalleTransaccionRaw {
  id: number;
  transaccion_id: number | null;
  producto_id: number | null;
  cantidad: number | null;
  precio_unitario: number | null;
  subtotal?: number | null;
  created_at: string | null;
}

export interface DetalleTransaccion {
  id: number;
  transaccion_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

export interface HistoryModel {
  version: string;
  fecha: string;
  framework: ModelType;
  precision: number;
  notes?: string;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}
export interface PrPoint {
  recall: number;
  precision: number;
}
export interface RegressionPoint {
  epoch: number;
  loss: number;
  accuracy: number;
  movingAvg?: number;
}
export const useModelos = () => {
  // Estado general del modelo
  const [activeModel, setActiveModel] = useState<ModelInfo>({
    name: "FraudNet",
    version: "v4.1",
    framework: "PyTorch",
    lastTrainingDate: new Date().toISOString().split("T")[0],
    status: "Activo",
  });

  const [mainMetrics, setMainMetrics] = useState<Metrics>({
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.86,
    f1: 0.87,
    aucRoc: 0.94,
  });

  const [previousMetrics, setPreviousMetrics] = useState<Metrics>({
    accuracy: 0.9,
    precision: 0.86,
    recall: 0.84,
    f1: 0.85,
    aucRoc: 0.92,
  });

  // Limpieza de datos
  const [rawData] = useState<DetalleTransaccionRaw[]>(() => {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        transaccion_id: 1001,
        producto_id: 501,
        cantidad: 2,
        precio_unitario: 15.5,
        subtotal: null,
        created_at: now,
      },
      {
        id: 2,
        transaccion_id: 1002,
        producto_id: 502,
        cantidad: null,
        precio_unitario: 20.0,
        subtotal: null,
        created_at: now,
      },
      {
        id: 3,
        transaccion_id: 1003,
        producto_id: null,
        cantidad: 3,
        precio_unitario: 10.0,
        subtotal: null,
        created_at: now,
      },
      {
        id: 4,
        transaccion_id: 1004,
        producto_id: 504,
        cantidad: 1,
        precio_unitario: null,
        subtotal: null,
        created_at: now,
      },
      {
        id: 5,
        transaccion_id: 1005,
        producto_id: 505,
        cantidad: 5,
        precio_unitario: 8.2,
        subtotal: null,
        created_at: now,
      },
    ];
  });
  const [cleanData, setCleanData] = useState<DetalleTransaccion[]>([]);
  const [cleaningLogs, setCleaningLogs] = useState<string[]>([]);
  const [cleaningSteps, setCleaningSteps] = useState<
    {
      label: string;
      done: boolean;
    }[]
  >([
    { label: "Validar claves foráneas", done: false },
    { label: "Eliminar nulos e imputar valores", done: false },
    { label: "Calcular subtotal y normalizar precios", done: false },
    { label: "Generar dataset final", done: false },
  ]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningCompleted, setCleaningCompleted] = useState(false);

  // Entrenamiento
  const [epochs, setEpochs] = useState<number>(10);
  const [modelType, setModelType] = useState<ModelType>("PyTorch");
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [regressionSeries, setRegressionSeries] = useState<RegressionPoint[]>(
    []
  );
  const [predictedData, setPredictedData] = useState<{ real: number; predicted: number }[]>([]);
  const trainingIntervalRef = useRef<number | null>(null);
  // Historial de modelos
  const [modelsHistory, setModelsHistory] = useState<HistoryModel[]>([
    {
      version: "v4.0",
      fecha: "2025-09-10",
      framework: "PyTorch",
      precision: 0.86,
    },
    {
      version: "v4.1",
      fecha: "2025-10-02",
      framework: "PyTorch",
      precision: 0.89,
    },
  ]);
  const [selectedHistoryModel, setSelectedHistoryModel] =
    useState<HistoryModel | null>(null);

  const executeCleaning = async () => {
    if (isCleaning) return;
    setIsCleaning(true);
    setCleaningLogs((prev) => [...prev, "Iniciando limpieza de datos..."]);

    const stepUpdates = [
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 0 ? { ...s, done: true } : s))
        ),
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 1 ? { ...s, done: true } : s))
        ),
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 2 ? { ...s, done: true } : s))
        ),
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 3 ? { ...s, done: true } : s))
        ),
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 4 ? { ...s, done: true } : s))
        ),
      () =>
        setCleaningSteps((prev) =>
          prev.map((s, i) => (i === 5 ? { ...s, done: true } : s))
        ),
    ];

    for (let i = 0; i < stepUpdates.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      const logMsg = [
      "Iniciando proceso de limpieza de datos...",
      "Validando claves foráneas (transaccion_id, producto_id)...",
      "Relaciones entre tablas verificadas correctamente",
      "Imputando valores nulos y eliminando registros inválidos...",
      "Columnas afectadas: precio_unitario, cantidad, categoria_id.",
      "Calculando subtotal y normalizando precio_unitario...",
      ][i];
      setCleaningLogs((prev) => [...prev, logMsg]);
      stepUpdates[i]();
    }

    // Transformación de datos con imputación para mantener 5 registros
    const preciosValidos = rawData
      .filter((r) => r.precio_unitario != null)
      .map((r) => r.precio_unitario!);
    const avgPrecio =
      preciosValidos.length > 0
        ? preciosValidos.reduce((a, b) => a + b, 0) / preciosValidos.length
        : 10;

    const cleaned = rawData.map((r) => {
      const cantidad = r.cantidad ?? 1;
      const precio = r.precio_unitario ?? parseFloat(avgPrecio.toFixed(2));
      const productoId = r.producto_id ?? (500 + r.id);
      const transaccionId = r.transaccion_id ?? (1000 + r.id);
      const subtotal = parseFloat((cantidad * precio).toFixed(2));
      return {
        id: r.id,
        transaccion_id: transaccionId,
        producto_id: productoId,
        cantidad,
        precio_unitario: precio,
        subtotal,
        created_at: r.created_at ?? new Date().toISOString(),
      };
    });

    setCleanData(cleaned);
    setCleaningLogs((prev) => [
      ...prev,
      `Limpieza completada. Registros finales: ${cleaned.length}`,
    ]);
    setIsCleaning(false);
    setCleaningCompleted(true);
  };

  const startTraining = () => {
    if (isTraining) return;
    if (!cleaningCompleted) {
      setTrainingLogs((prev) => [
        ...prev,
        "⚠️ Debe completar la limpieza antes de entrenar.",
      ]);
      return;
    }

    setActiveModel((m) => ({ ...m, status: "Entrenamiento" }));
    setIsTraining(true);
    setTrainingLogs((prev) => [
      ...prev,
      `Iniciando entrenamiento (${modelType}) por ${epochs} epochs...`,
    ]);
    setCurrentEpoch(0);
    setTrainingProgress(0);
    setPredictedData([]);
    setRegressionSeries([]);

    const total = epochs;
    let epoch = 0;
    trainingIntervalRef.current = window.setInterval(() => {
      epoch += 1;
      setCurrentEpoch(epoch);
      const pct = Math.round((epoch / total) * 100);
      setTrainingProgress(pct);

      const loss = parseFloat((1.2 / epoch + Math.random() * 0.05).toFixed(3));
      const accuracy = parseFloat(
        (
          0.5 +
          (Math.log(epoch + 1) / Math.log(total + 1)) * 0.5 +
          Math.random() * 0.02
        ).toFixed(3)
      );
      // Generamos valores simulados Real vs Predicho
      const realValue = parseFloat((Math.random() * 100).toFixed(2));
      const predictedValue = parseFloat((realValue * (0.8 + Math.random() * 0.4)).toFixed(2)); // predicción con pequeño margen de error
      // Calculamos promedio móvil de la pérdida (últimos 3 puntos)
      const prevLosses = [...regressionSeries.map((r) => r.loss), loss];
      const windowSize = 3;
      const movingAvg = parseFloat(
        (
          prevLosses.slice(-windowSize).reduce((a, b) => a + b, 0) /
          Math.min(prevLosses.length, windowSize)
        ).toFixed(3)
      );

      setRegressionSeries((prev) => [
        ...prev,
        { epoch, loss, accuracy, movingAvg },
      ]);
      setTrainingLogs((prev) => [
        ...prev,
        `Epoch ${epoch}/${total} - loss: ${loss}, acc: ${accuracy}`,
      ]);
      setPredictedData(prev => [...prev, { real: realValue, predicted: predictedValue }]);
      if (epoch >= total) {
        if (trainingIntervalRef.current)
          window.clearInterval(trainingIntervalRef.current);
        setIsTraining(false);
        setActiveModel((m) => ({
          ...m,
          lastTrainingDate: new Date().toISOString().split("T")[0],
          status: "Activo",
        }));
        const newMetrics: Metrics = {
          accuracy: parseFloat((0.9 + Math.random() * 0.06).toFixed(2)),
          precision: parseFloat((0.88 + Math.random() * 0.05).toFixed(2)),
          recall: parseFloat((0.85 + Math.random() * 0.05).toFixed(2)),
          f1: parseFloat((0.86 + Math.random() * 0.05).toFixed(2)),
          aucRoc: parseFloat((0.93 + Math.random() * 0.04).toFixed(2)),
        };
        setPreviousMetrics(mainMetrics);
        setMainMetrics(newMetrics);
        setTrainingLogs((prev) => [...prev, "Entrenamiento completado."]);
      }
    }, 500);
  };

  const exportResults = () => {
    setTrainingLogs((prev) => [
      ...prev,
      "Exportando resultados a PostgreSQL...",
    ]);
    // Simula insert en historial
    const newVersion = `${activeModel.version.replace("v", "v")}-new`;
    setModelsHistory((prev) => [
      {
        version: newVersion,
        fecha: new Date().toISOString().split("T")[0],
        framework: modelType,
        precision: mainMetrics.precision,
      },
      ...prev,
    ]);
    setTrainingLogs((prev) => [...prev, "Exportación completada."]);
  };

  const deleteVersion = (version: string) => {
    setModelsHistory((prev) => prev.filter((m) => m.version !== version));
  };

  const colors = useMemo(
    () => ({
      primary: PRIMARY_COLOR,
    }),
    []
  );

  return {
    // estado general
    activeModel,
    mainMetrics,
    previousMetrics,

    // limpieza
    rawData,
    cleanData,
    cleaningLogs,
    cleaningSteps,
    isCleaning,
    cleaningCompleted,
    executeCleaning,

    // entrenamiento
    epochs,
    setEpochs,
    modelType,
    setModelType,
    currentEpoch,
    trainingProgress,
    isTraining,
    trainingLogs,
    regressionSeries,
    predictedData,
    startTraining,
    exportResults,

    // historial
    modelsHistory,
    selectedHistoryModel,
    setSelectedHistoryModel,
    deleteVersion,

    // estilos
    colors,
  };
};
