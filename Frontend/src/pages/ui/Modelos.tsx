import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  BrushCleaning,
  Cog,
  ReceiptText,
  GitCompare,
  LineChart
} from 'lucide-react';
import {
  ModelStatusCard,
  DatasetBadge,
  DataCleaningPanel,
  TrainingForm,
  TrainingProgressBar,
  TrainingLogsViewer,
  ExportModelButton,
  RegressionLineChart,
  PredictedVsRealChart,
  ModelComparisonTable,
  ModelHistoryTable,
  ModelDetailModal
} from '../../components/modelos';
import ScoreDistributionChart from '../../components/dashboard/ScoreDistributionChart';
import { useModelos } from '../hook/useModelos';

const Modelos: React.FC = () => {
  const {
    activeModel,
    mainMetrics,
    previousMetrics,
    rawData,
    cleanData,
    cleaningLogs,
    cleaningSteps,
    isCleaning,
    cleaningCompleted,
    executeCleaning,
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
    modelsHistory,
    selectedHistoryModel,
    setSelectedHistoryModel,
    deleteVersion
  } = useModelos();

  const [view, setView] = useState<'cleaning' | 'training' | 'reports'>('cleaning');

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 font-sans animate-fadeIn">
      {/* Header */}
      <div className="mb-10 bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-sm shadow-inner">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              Modelos y Entrenamiento
            </h1>
            <p className="text-green-100 font-medium mt-1">
              Gestiona el ciclo de vida del modelo: limpieza, entrenamiento y reportes.
            </p>
          </div>
        </div>
      </div>

      {/* Estado general */}
      <div className="mb-8">
        <ModelStatusCard model={activeModel} metrics={mainMetrics} />
      </div>

      {/* Botones de vista */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setView('cleaning')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition-all duration-200 ${
            view === 'cleaning'
              ? 'bg-green-100 border-green-400 text-green-700 shadow-sm'
              : 'bg-white border-green-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
          }`}
        >
          <BrushCleaning className="w-5 h-5" /> Limpieza
        </button>

        <button
          onClick={() => setView('training')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition-all duration-200 ${
            view === 'training'
              ? 'bg-green-100 border-green-400 text-green-700 shadow-sm'
              : 'bg-white border-green-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
          }`}
        >
          <Cog className="w-5 h-5" /> Entrenamiento
        </button>

        <button
          onClick={() => setView('reports')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition-all duration-200 ${
            view === 'reports'
              ? 'bg-green-100 border-green-400 text-green-700 shadow-sm'
              : 'bg-white border-green-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
          }`}
        >
          <ReceiptText className="w-5 h-5" /> Reportes
        </button>
      </div>

      {/* Subvistas */}
      <AnimatePresence mode="wait">
        {/* Limpieza */}
        {view === 'cleaning' && (
          <motion.div
            key="cleaning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <DataCleaningPanel
              steps={cleaningSteps}
              onExecute={executeCleaning}
              logs={cleaningLogs}
              raw={rawData}
              clean={cleanData}
              running={isCleaning}
              completed={cleaningCompleted}
            />
          </motion.div>
        )}

        {/* Entrenamiento */}
        {view === 'training' && (
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel lateral */}
              <div className="lg:col-span-1 flex flex-col space-y-4 lg:min-h-[600px]">
                <TrainingForm
                  epochs={epochs}
                  setEpochs={setEpochs}
                  modelType={modelType}
                  setModelType={setModelType}
                  onStart={startTraining}
                  disabled={!cleaningCompleted}
                  isTraining={isTraining}
                />

                <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 space-y-4">
                  <TrainingProgressBar
                    progress={trainingProgress}
                    currentEpoch={currentEpoch}
                    totalEpochs={epochs}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ExportModelButton onClick={exportResults} disabled={isTraining} />
                    <DatasetBadge name="detalle_transacciones" rows={cleanData.length} />
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <TrainingLogsViewer logs={trainingLogs} />
                </div>
              </div>

              {/* Gráficos */}
              <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-green-100 space-y-6">
                {regressionSeries.length > 0 ? (
                  <RegressionLineChart data={regressionSeries} />
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">
                    Inicia el entrenamiento para ver las métricas.
                  </p>
                )}

                {predictedData.length > 0 ? (
                  <PredictedVsRealChart data={predictedData} />
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">
                    Inicia el entrenamiento para ver el gráfico de predicciones.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reportes */}
        {view === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {/* Comparación */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <GitCompare className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Comparación de Modelos
                </h3>
              </div>
              <div className="border border-green-100 rounded-xl shadow-sm bg-white">
                <ModelComparisonTable prev={previousMetrics} curr={mainMetrics} />
              </div>
            </section>

            {/* Distribución */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribución del Score de Fraude
                </h3>
              </div>
              <div className="border border-green-100 rounded-xl shadow-sm bg-white p-4">
                <ScoreDistributionChart
                  data={[
                    { range: '0-20', count: 80 },
                    { range: '21-40', count: 120 },
                    { range: '41-60', count: 210 },
                    { range: '61-80', count: 320 },
                    { range: '81-90', count: 480 },
                    { range: '91-95', count: 820 },
                    { range: '96-100', count: 450 },
                  ]}
                  isLoading={false}
                />
              </div>
            </section>

            {/* Historial */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Historial de Modelos
                </h3>
              </div>
              <div className="border border-green-100 rounded-xl shadow-sm bg-white">
                <ModelHistoryTable
                  data={modelsHistory}
                  onView={(m) => setSelectedHistoryModel(m)}
                  onDelete={deleteVersion}
                />
              </div>

              <ModelDetailModal
                open={!!selectedHistoryModel}
                onClose={() => setSelectedHistoryModel(null)}
                model={selectedHistoryModel}
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Modelos;
